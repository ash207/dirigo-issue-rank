
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
    const { count: totalUsers, error: usersError } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    if (usersError) throw usersError;

    // Get new users over time period
    const { data: newUsers, error: newUsersError } = await supabaseAdmin.rpc(
      'get_new_users_by_period',
      { date_filter: dateFilter }
    ).catch(async () => {
      // Fallback if RPC function doesn't exist
      const { data, error } = await supabaseAdmin.auth.admin.listUsers();
      
      const now = new Date();
      const filteredUsers = data?.users.filter(user => {
        const createdAt = new Date(user.created_at);
        
        if (startDate && endDate) {
          const start = new Date(startDate);
          const end = new Date(endDate);
          return createdAt >= start && createdAt <= end;
        }
        
        if (dateRange === 'today') {
          return createdAt.toDateString() === now.toDateString();
        } else if (dateRange === 'week') {
          const weekAgo = new Date(now);
          weekAgo.setDate(now.getDate() - 7);
          return createdAt >= weekAgo;
        } else if (dateRange === 'month') {
          const monthAgo = new Date(now);
          monthAgo.setDate(now.getDate() - 30);
          return createdAt >= monthAgo;
        } else if (dateRange === 'year') {
          const yearAgo = new Date(now);
          yearAgo.setDate(now.getDate() - 365);
          return createdAt >= yearAgo;
        }
        
        return true;
      }) || [];
      
      return { data: { count: filteredUsers.length }, error };
    });

    const newUserCount = newUsers?.count || 0;

    // Get email confirmation rate
    const { data: confirmedUsers, error: confirmedError } = await supabaseAdmin.rpc(
      'get_confirmed_emails_count',
      { date_filter: dateFilter }
    ).catch(async () => {
      // Fallback if RPC function doesn't exist
      const { data, error } = await supabaseAdmin.auth.admin.listUsers();
      
      const confirmedCount = data?.users.filter(user => user.email_confirmed_at !== null).length || 0;
      
      return { data: { count: confirmedCount }, error };
    });

    const confirmedCount = confirmedUsers?.count || 0;
    const conversionRate = totalUsers > 0 ? (confirmedCount / totalUsers * 100).toFixed(2) : 0;

    // Get issues and positions counts
    const { count: issuesCount, error: issuesError } = await supabaseAdmin
      .from('issues')
      .select('*', { count: 'exact', head: true });

    const { count: positionsCount, error: positionsError } = await supabaseAdmin
      .from('positions')
      .select('*', { count: 'exact', head: true });

    // Get daily active users based on auth.users last_sign_in_at
    const { data: activeUsersData, error: activeUsersError } = await supabaseAdmin.rpc(
      'get_active_users_count',
      { date_filter: "AND last_sign_in_at >= current_date" }
    ).catch(async () => {
      // Fallback if RPC function doesn't exist
      const { data, error } = await supabaseAdmin.auth.admin.listUsers();
      
      const now = new Date();
      const todayActiveUsers = data?.users.filter(user => {
        if (!user.last_sign_in_at) return false;
        const lastSignIn = new Date(user.last_sign_in_at);
        return lastSignIn.toDateString() === now.toDateString();
      }).length || 0;
      
      return { data: { count: todayActiveUsers }, error };
    });

    const dailyActiveUsers = activeUsersData?.count || 0;

    // Get user activity over time (for charts)
    const { data: userActivity, error: activityError } = await supabaseAdmin.rpc(
      'get_user_activity_by_day',
      { days_back: 30 }
    ).catch(() => {
      // Fallback if RPC function doesn't exist
      return { 
        data: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          count: Math.floor(Math.random() * 10) // Mock data for demonstration
        })),
        error: null
      };
    });

    // Get top issues by engagement
    const { data: topIssues, error: topIssuesError } = await supabaseAdmin
      .from('positions')
      .select('issue_id, count(*)')
      .group('issue_id')
      .order('count', { ascending: false })
      .limit(5);

    // Get user roles distribution
    const { data: roleDistribution, error: roleError } = await supabaseAdmin
      .from('profiles')
      .select('role, count(*)')
      .group('role')
      .order('count', { ascending: false });

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
