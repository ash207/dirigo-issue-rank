
import { useState, useEffect, useCallback } from "react";
import { AnalyticsFilters } from "./AnalyticsFilters";
import { AnalyticsOverview } from "./AnalyticsOverview";
import { AnalyticsCharts } from "./AnalyticsCharts";
import { AnalyticsActions } from "./AnalyticsActions";
import { AnalyticsDataTable } from "./AnalyticsDataTable";
import { AnalyticsData, DateRange, fetchAnalyticsData } from "@/services/analyticsService";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export function AnalyticsTabContent() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState({
    dateRange: 'week' as DateRange
  });

  const loadAnalyticsData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await fetchAnalyticsData(filter);
      setAnalyticsData(data);
      setError(null);
    } catch (err: any) {
      console.error("Error loading analytics data:", err);
      setError(err.message || "Failed to load analytics data");
      toast.error(err.message || "Failed to load analytics data");
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

  const emptyMetrics = {
    totalUsers: 0,
    newUsers: 0,
    dailyActiveUsers: 0,
    conversionRate: 0,
    issuesCount: 0,
    positionsCount: 0
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
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error}. The analytics service may be unavailable. Please try again later or contact support.
          </AlertDescription>
        </Alert>
      )}
      
      <AnalyticsOverview
        metrics={analyticsData?.overviewMetrics || emptyMetrics}
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
