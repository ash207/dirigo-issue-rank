
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the Admin key
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Only allow authorized requests
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify the user is authenticated
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user is an admin
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    // Only allow access to admin users (for security)
    if (!profile || profile.role !== "dirigo_admin") {
      return new Response(
        JSON.stringify({ error: "Unauthorized - Admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body for filtering parameters
    let body;
    let dateRange = 'week'; // Default to week
    let startDate = null;
    let endDate = null;
    
    if (req.body) {
      try {
        body = await req.json();
        dateRange = body.dateRange || 'week';
        startDate = body.startDate || null;
        endDate = body.endDate || null;
      } catch (e) {
        console.error("Error parsing JSON body:", e);
      }
    }

    // Build date filter
    let dateFilter = '';
    if (startDate && endDate) {
      dateFilter = `AND created_at >= '${startDate}' AND created_at <= '${endDate}'`;
    } else {
      switch (dateRange) {
        case 'today':
          dateFilter = "AND created_at >= current_date";
          break;
        case 'week':
          dateFilter = "AND created_at >= current_date - interval '7 days'";
          break;
        case 'month':
          dateFilter = "AND created_at >= current_date - interval '30 days'";
          break;
        case 'year':
          dateFilter = "AND created_at >= current_date - interval '365 days'";
          break;
        default:
          dateFilter = "AND created_at >= current_date - interval '7 days'";
      }
    }

    // Get total users count
    const { count: totalUsers } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    // Get new users over time period
    let newUserCount = 0;
    try {
      const { data: newUsersData } = await supabaseAdmin
        .from('profiles')
        .select('id', { count: 'exact' })
        .gte('created_at', dateRange === 'today' 
          ? new Date(new Date().setHours(0, 0, 0, 0)).toISOString()
          : dateRange === 'week'
          ? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
          : dateRange === 'month'
          ? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
          : new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString());
      
      newUserCount = newUsersData?.length || 0;
    } catch (error) {
      console.error("Error getting new users:", error);
    }

    // Get confirmed users count from auth.users
    const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers();
    const confirmedCount = authUsers?.users.filter(user => user.email_confirmed_at !== null).length || 0;
    const conversionRate = totalUsers > 0 ? (confirmedCount / totalUsers * 100).toFixed(2) : 0;

    // Get issues and positions counts
    const { count: issuesCount } = await supabaseAdmin
      .from('issues')
      .select('*', { count: 'exact', head: true });

    const { count: positionsCount } = await supabaseAdmin
      .from('positions')
      .select('*', { count: 'exact', head: true });

    // Get daily active users based on auth.users last_sign_in_at
    const today = new Date().toISOString().split('T')[0];
    const dailyActiveUsers = authUsers?.users.filter(user => {
      return user.last_sign_in_at && user.last_sign_in_at.startsWith(today);
    }).length || 0;

    // Get user activity over time (for charts)
    // Generate dates for the last 30 days
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

    // Get top issues by engagement
    const { data: positions } = await supabaseAdmin
      .from('positions')
      .select('issue_id');
    
    const issueCount = {};
    positions?.forEach(position => {
      if (position.issue_id) {
        issueCount[position.issue_id] = (issueCount[position.issue_id] || 0) + 1;
      }
    });
    
    const topIssues = Object.entries(issueCount).map(([issue_id, count]) => ({
      issue_id,
      count
    })).sort((a, b) => b.count - a.count).slice(0, 5);

    // Get user roles distribution
    const { data: profiles } = await supabaseAdmin
      .from('profiles')
      .select('role');
    
    const roleCounts = {};
    profiles?.forEach(profile => {
      if (profile.role) {
        roleCounts[profile.role] = (roleCounts[profile.role] || 0) + 1;
      }
    });
    
    const roleDistribution = Object.entries(roleCounts).map(([role, count]) => ({
      role,
      count
    }));

    // Combine all analytics data
    const analyticsData = {
      overviewMetrics: {
        totalUsers: totalUsers || 0,
        newUsers: newUserCount,
        dailyActiveUsers,
        conversionRate,
        issuesCount: issuesCount || 0,
        positionsCount: positionsCount || 0,
      },
      userActivity: userActivity || [],
      topIssues: topIssues || [],
      roleDistribution: roleDistribution || [],
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
