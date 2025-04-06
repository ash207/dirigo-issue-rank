
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { authenticateRequest } from "./auth.ts";
import { parseFilterParams, buildDateFilter } from "./filters.ts";
import { 
  getTotalUsers, 
  getNewUsers, 
  getConversionRate,
  getDailyActiveUsers
} from "./userMetrics.ts";
import {
  getContentCounts,
  getUserActivity,
  getTopIssues,
  getRoleDistribution
} from "./contentMetrics.ts";
import {
  getErrorMetrics,
  getErrorTimeline,
  getTopErrorComponents,
  getErrorsByType
} from "./errorMetrics.ts";

// CORS headers for all responses
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Handle the request
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = await authenticateRequest(req);
    
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
    
    // Get error metrics
    const errorMetrics = await getErrorMetrics(supabaseAdmin, dateRange, startDate, endDate);
    const errorTimeline = await getErrorTimeline(supabaseAdmin, dateRange, startDate, endDate);
    const topErrorComponents = await getTopErrorComponents(supabaseAdmin, dateRange, startDate, endDate);
    const errorsByType = await getErrorsByType(supabaseAdmin, dateRange, startDate, endDate);

    // Combine all analytics data
    const analyticsData = {
      overviewMetrics: {
        totalUsers,
        newUsers: newUserCount,
        dailyActiveUsers,
        conversionRate,
        issuesCount,
        positionsCount,
        totalErrors: errorMetrics.totalErrors,
        uniqueUserErrors: errorMetrics.uniqueUserErrors,
      },
      userActivity,
      topIssues,
      roleDistribution,
      errorMetrics: {
        errorTimeline,
        topErrorComponents,
        errorsByType
      }
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
