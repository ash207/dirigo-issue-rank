
import { useState, useEffect, useCallback } from "react";
import { AnalyticsFilters } from "./AnalyticsFilters";
import { AnalyticsOverview } from "./AnalyticsOverview";
import { AnalyticsCharts } from "./AnalyticsCharts";
import { AnalyticsActions } from "./AnalyticsActions";
import { AnalyticsDataTable } from "./AnalyticsDataTable";
import { AnalyticsData, DateRange, fetchAnalyticsData } from "@/services/analyticsService";
import { toast } from "sonner";

export function AnalyticsTabContent() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState({
    dateRange: 'week' as DateRange
  });

  const loadAnalyticsData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchAnalyticsData(filter);
      setAnalyticsData(data);
    } catch (error: any) {
      console.error("Error loading analytics data:", error);
      toast.error(error.message || "Failed to load analytics data");
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadAnalyticsData();
  }, [loadAnalyticsData]);

  const handleFilterChange = (newFilter: {
    dateRange: DateRange;
    startDate?: string;
    endDate?: string;
  }) => {
    setFilter(newFilter);
  };

  const handleRefresh = () => {
    loadAnalyticsData();
  };

  return (
    <div className="space-y-6">
      <AnalyticsActions
        data={analyticsData}
        onRefresh={handleRefresh}
        isLoading={isLoading}
      />
      
      <AnalyticsFilters
        onFilterChange={handleFilterChange}
        isLoading={isLoading}
      />
      
      <AnalyticsOverview
        metrics={analyticsData?.overviewMetrics || {
          totalUsers: 0,
          newUsers: 0,
          dailyActiveUsers: 0,
          conversionRate: 0,
          issuesCount: 0,
          positionsCount: 0
        }}
        isLoading={isLoading}
      />
      
      <AnalyticsCharts
        userActivity={analyticsData?.userActivity || []}
        roleDistribution={analyticsData?.roleDistribution || []}
        isLoading={isLoading}
      />
      
      <AnalyticsDataTable
        data={analyticsData}
        isLoading={isLoading}
      />
    </div>
  );
}
