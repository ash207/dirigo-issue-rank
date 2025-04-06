
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
async function parseFilterParams(req) {
  let dateRange = 'week'; // Default to week
  let startDate = null;
  let endDate = null;
  
  if (req.body) {
    try {
      const body = await req.json();
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
async function getNewUsers(supabaseAdmin, dateRange, startDate, endDate) {
  try {
    let dateFilter;
    
    if (startDate && endDate) {
      dateFilter = `created_at >= '${startDate}' AND created_at <= '${endDate}'`;
    } else {
      switch (dateRange) {
        case 'today':
          dateFilter = "created_at >= current_date";
          break;
        case 'week':
          dateFilter = "created_at >= current_date - interval '7 days'";
          break;
        case 'month':
          dateFilter = "created_at >= current_date - interval '30 days'";
          break;
        case 'year':
        default:
          dateFilter = "created_at >= current_date - interval '365 days'";
      }
    }
    
    const { data: newUsersData, error } = await supabaseAdmin
      .from('profiles')
      .select('id', { count: 'exact' })
      .filter(dateFilter);
    
    if (error) {
      console.error("Error getting new users:", error);
      return 0;
    }
    
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
async function getContentCounts(supabaseAdmin, dateRange, startDate, endDate) {
  let dateFilter = '';
  
  if (startDate && endDate) {
    dateFilter = `created_at >= '${startDate}' AND created_at <= '${endDate}'`;
  } else {
    switch (dateRange) {
      case 'today':
        dateFilter = "created_at >= current_date";
        break;
      case 'week':
        dateFilter = "created_at >= current_date - interval '7 days'";
        break;
      case 'month':
        dateFilter = "created_at >= current_date - interval '30 days'";
        break;
      case 'year':
      default:
        dateFilter = "created_at >= current_date - interval '365 days'";
    }
  }

  const { count: issuesCount } = await supabaseAdmin
    .from('issues')
    .select('*', { count: 'exact', head: true })
    .filter(dateFilter);

  const { count: positionsCount } = await supabaseAdmin
    .from('positions')
    .select('*', { count: 'exact', head: true })
    .filter(dateFilter);
  
  return { issuesCount: issuesCount || 0, positionsCount: positionsCount || 0 };
}

// Get user activity over time (for charts)
async function getUserActivity(supabaseAdmin, dateRange, startDate, endDate) {
  let startDateObj;
  let numDays;
  
  if (startDate && endDate) {
    startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    numDays = Math.ceil((endDateObj.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    numDays = Math.min(numDays, 90); // Cap at 90 days to prevent performance issues
  } else {
    const today = new Date();
    
    switch (dateRange) {
      case 'today':
        startDateObj = new Date(today);
        numDays = 1;
        break;
      case 'week':
        startDateObj = new Date(today);
        startDateObj.setDate(today.getDate() - 6);
        numDays = 7;
        break;
      case 'month':
        startDateObj = new Date(today);
        startDateObj.setDate(today.getDate() - 29);
        numDays = 30;
        break;
      case 'year':
      default:
        startDateObj = new Date(today);
        startDateObj.setDate(today.getDate() - 364);
        numDays = 365;
    }
  }
  
  const userActivity = [];
  const { data: profiles } = await supabaseAdmin.from('profiles').select('created_at');
  
  for (let day = 0; day < numDays; day++) {
    const currentDate = new Date(startDateObj);
    currentDate.setDate(startDateObj.getDate() + day);
    const dateStr = currentDate.toISOString().split('T')[0];
    
    // Count signups for this date
    const signupsOnDay = profiles?.filter(profile => {
      return profile.created_at && profile.created_at.startsWith(dateStr);
    }).length || 0;
    
    userActivity.push({
      date: dateStr,
      count: signupsOnDay
    });
  }
  
  return userActivity;
}

// Get top issues by engagement
async function getTopIssues(supabaseAdmin, dateRange, startDate, endDate) {
  let dateFilter = '';
  
  if (startDate && endDate) {
    dateFilter = `created_at >= '${startDate}' AND created_at <= '${endDate}'`;
  } else {
    switch (dateRange) {
      case 'today':
        dateFilter = "created_at >= current_date";
        break;
      case 'week':
        dateFilter = "created_at >= current_date - interval '7 days'";
        break;
      case 'month':
        dateFilter = "created_at >= current_date - interval '30 days'";
        break;
      case 'year':
      default:
        dateFilter = "created_at >= current_date - interval '365 days'";
    }
  }

  const { data: positions } = await supabaseAdmin
    .from('positions')
    .select('issue_id, created_at')
    .filter(dateFilter);
  
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
    const newUserCount = await getNewUsers(supabaseAdmin, dateRange, startDate, endDate);
    const conversionRate = await getConversionRate(supabaseAdmin, totalUsers);
    const { issuesCount, positionsCount } = await getContentCounts(supabaseAdmin, dateRange, startDate, endDate);
    const dailyActiveUsers = getDailyActiveUsers(authUsers);
    const userActivity = await getUserActivity(supabaseAdmin, dateRange, startDate, endDate);
    const topIssues = await getTopIssues(supabaseAdmin, dateRange, startDate, endDate);
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
