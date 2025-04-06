
import { supabase } from "@/integrations/supabase/client";

export type DateRange = 'today' | 'week' | 'month' | 'year' | 'custom';

export type AnalyticsFilter = {
  dateRange: DateRange;
  startDate?: string;
  endDate?: string;
};

export type OverviewMetrics = {
  totalUsers: number;
  newUsers: number;
  dailyActiveUsers: number;
  conversionRate: number | string;
  issuesCount: number;
  positionsCount: number;
};

export type UserActivityData = {
  date: string;
  count: number;
};

export type TopIssue = {
  issue_id: string;
  count: number;
};

export type RoleDistribution = {
  role: string;
  count: number;
};

export type AnalyticsData = {
  overviewMetrics: OverviewMetrics;
  userActivity: UserActivityData[];
  topIssues: TopIssue[];
  roleDistribution: RoleDistribution[];
};

export const fetchAnalyticsData = async (filter: AnalyticsFilter): Promise<AnalyticsData> => {
  const session = await supabase.auth.getSession();
  
  if (!session.data.session) {
    throw new Error("Authentication required");
  }

  try {
    const { data, error } = await supabase.functions.invoke("get-analytics", {
      headers: {
        Authorization: `Bearer ${session.data.session.access_token}`
      },
      body: filter
    });

    if (error) {
      console.error("Error fetching analytics data:", error);
      throw error;
    }

    if (!data) {
      throw new Error("No data returned from analytics service");
    }

    return data as AnalyticsData;
  } catch (error) {
    console.error("Error fetching analytics data:", error);
    
    // Return fallback data for development/testing
    return {
      overviewMetrics: {
        totalUsers: 0,
        newUsers: 0,
        dailyActiveUsers: 0,
        conversionRate: 0,
        issuesCount: 0,
        positionsCount: 0,
      },
      userActivity: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        count: 0
      })),
      topIssues: [],
      roleDistribution: []
    };
  }
};

export const downloadAnalyticsData = (data: AnalyticsData, format: 'csv' | 'json' = 'csv') => {
  if (format === 'json') {
    // Download as JSON
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics_data_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } else {
    // Download as CSV
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Overview metrics
    csvContent += "Metric,Value\r\n";
    Object.entries(data.overviewMetrics).forEach(([key, value]) => {
      csvContent += `${key},${value}\r\n`;
    });
    
    // Add separator
    csvContent += "\r\n";
    
    // User Activity
    csvContent += "Date,User Count\r\n";
    data.userActivity.forEach(activity => {
      csvContent += `${activity.date},${activity.count}\r\n`;
    });
    
    // Add separator
    csvContent += "\r\n";
    
    // Role Distribution
    csvContent += "Role,Count\r\n";
    data.roleDistribution.forEach(role => {
      csvContent += `${role.role},${role.count}\r\n`;
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `analytics_data_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
