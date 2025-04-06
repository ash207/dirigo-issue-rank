
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

// CORS headers for all responses
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Create a Supabase admin client
function createSupabaseAdmin() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  return createClient(supabaseUrl, supabaseServiceKey);
}

// Authenticate the request and verify admin access
async function authenticateRequest(req, supabaseAdmin) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    throw new Error("No authorization header");
  }

  const token = authHeader.replace("Bearer ", "");
  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

  if (authError || !user) {
    throw new Error("Unauthorized");
  }

  // Check if user is an admin
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  // Only allow access to admin users
  if (!profile || profile.role !== "dirigo_admin") {
    throw new Error("Unauthorized - Admin access required");
  }

  return user;
}

// Parse request body for filter parameters
function parseFilterParams(req) {
  let body;
  let dateRange = 'week'; // Default to week
  let startDate = null;
  let endDate = null;
  
  if (req.body) {
    try {
      body = req.json();
      dateRange = body.dateRange || 'week';
      startDate = body.startDate || null;
      endDate = body.endDate || null;
    } catch (e) {
      console.error("Error parsing JSON body:", e);
    }
  }

  return { dateRange, startDate, endDate };
}

// Build SQL date filter based on date range
function buildDateFilter(dateRange, startDate, endDate) {
  if (startDate && endDate) {
    return `AND created_at >= '${startDate}' AND created_at <= '${endDate}'`;
  }
  
  switch (dateRange) {
    case 'today':
      return "AND created_at >= current_date";
    case 'week':
      return "AND created_at >= current_date - interval '7 days'";
    case 'month':
      return "AND created_at >= current_date - interval '30 days'";
    case 'year':
      return "AND created_at >= current_date - interval '365 days'";
    default:
      return "AND created_at >= current_date - interval '7 days'";
  }
}

// Get total users count
async function getTotalUsers(supabaseAdmin) {
  const { count } = await supabaseAdmin
    .from('profiles')
    .select('*', { count: 'exact', head: true });
  
  return count || 0;
}

// Get new users over time period
async function getNewUsers(supabaseAdmin, dateRange) {
  try {
    let startDate;
    switch (dateRange) {
      case 'today':
        startDate = new Date(new Date().setHours(0, 0, 0, 0)).toISOString();
        break;
      case 'week':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        break;
      case 'month':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        break;
      case 'year':
      default:
        startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString();
    }
    
    const { data: newUsersData } = await supabaseAdmin
      .from('profiles')
      .select('id', { count: 'exact' })
      .gte('created_at', startDate);
    
    return newUsersData?.length || 0;
  } catch (error) {
    console.error("Error getting new users:", error);
    return 0;
  }
}

// Get conversion rate (confirmed users / total users)
async function getConversionRate(supabaseAdmin, totalUsers) {
  const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers();
  const confirmedCount = authUsers?.users.filter(user => user.email_confirmed_at !== null).length || 0;
  return totalUsers > 0 ? (confirmedCount / totalUsers * 100).toFixed(2) : 0;
}

// Get daily active users
function getDailyActiveUsers(authUsers) {
  const today = new Date().toISOString().split('T')[0];
  return authUsers?.users.filter(user => {
    return user.last_sign_in_at && user.last_sign_in_at.startsWith(today);
  }).length || 0;
}

// Get issues and positions counts
async function getContentCounts(supabaseAdmin) {
  const { count: issuesCount } = await supabaseAdmin
    .from('issues')
    .select('*', { count: 'exact', head: true });

  const { count: positionsCount } = await supabaseAdmin
    .from('positions')
    .select('*', { count: 'exact', head: true });
  
  return { issuesCount: issuesCount || 0, positionsCount: positionsCount || 0 };
}

// Get user activity over time (for charts)
function getUserActivity(authUsers) {
  const userActivity = [];
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 29); // 30 days including today
  
  for (let day = 0; day < 30; day++) {
    const currentDate = new Date(start);
    currentDate.setDate(start.getDate() + day);
    const dateStr = currentDate.toISOString().split('T')[0];
    
    // Count signups for this date
    const signupsOnDay = authUsers?.users.filter(user => {
      return user.created_at && user.created_at.startsWith(dateStr);
    }).length || 0;
    
    userActivity.push({
      date: dateStr,
      count: signupsOnDay
    });
  }
  
  return userActivity;
}

// Get top issues by engagement
async function getTopIssues(supabaseAdmin) {
  const { data: positions } = await supabaseAdmin
    .from('positions')
    .select('issue_id');
  
  const issueCount = {};
  positions?.forEach(position => {
    if (position.issue_id) {
      issueCount[position.issue_id] = (issueCount[position.issue_id] || 0) + 1;
    }
  });
  
  return Object.entries(issueCount).map(([issue_id, count]) => ({
    issue_id,
    count
  })).sort((a, b) => b.count - a.count).slice(0, 5);
}

// Get user roles distribution
async function getRoleDistribution(supabaseAdmin) {
  const { data: profiles } = await supabaseAdmin
    .from('profiles')
    .select('role');
  
  const roleCounts = {};
  profiles?.forEach(profile => {
    if (profile.role) {
      roleCounts[profile.role] = (roleCounts[profile.role] || 0) + 1;
    }
  });
  
  return Object.entries(roleCounts).map(([role, count]) => ({
    role,
    count
  }));
}

// Handle the request
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createSupabaseAdmin();
    
    // Authenticate request and verify admin access
    await authenticateRequest(req, supabaseAdmin);
    
    // Parse filter parameters
    const { dateRange, startDate, endDate } = await parseFilterParams(req);
    
    // Get analytics data
    const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers();
    const totalUsers = await getTotalUsers(supabaseAdmin);
    const newUserCount = await getNewUsers(supabaseAdmin, dateRange);
    const conversionRate = await getConversionRate(supabaseAdmin, totalUsers);
    const { issuesCount, positionsCount } = await getContentCounts(supabaseAdmin);
    const dailyActiveUsers = getDailyActiveUsers(authUsers);
    const userActivity = getUserActivity(authUsers);
    const topIssues = await getTopIssues(supabaseAdmin);
    const roleDistribution = await getRoleDistribution(supabaseAdmin);

    // Combine all analytics data
    const analyticsData = {
      overviewMetrics: {
        totalUsers,
        newUsers: newUserCount,
        dailyActiveUsers,
        conversionRate,
        issuesCount,
        positionsCount,
      },
      userActivity,
      topIssues,
      roleDistribution,
    };

    return new Response(
      JSON.stringify(analyticsData),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in get-analytics function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
