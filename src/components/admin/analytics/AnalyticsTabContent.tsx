
import { useState, useEffect, useCallback } from "react";
import { AnalyticsFilters } from "./AnalyticsFilters";
import { AnalyticsOverview } from "./AnalyticsOverview";
import { AnalyticsCharts } from "./AnalyticsCharts";
import { AnalyticsActions } from "./AnalyticsActions";
import { AnalyticsDataTable } from "./AnalyticsDataTable";
import { ErrorMetricsSection } from "./ErrorMetricsSection";
import { AnalyticsData, DateRange, fetchAnalyticsData } from "@/services/analyticsService";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function AnalyticsTabContent() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState({
    dateRange: 'week' as DateRange
  });
  const [activeTab, setActiveTab] = useState("overview");

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
    positionsCount: 0,
    totalErrors: 0,
    uniqueUserErrors: 0
  };

  const emptyErrorMetrics = {
    errorTimeline: [],
    topErrorComponents: [],
    errorsByType: []
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
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="errors">Error Monitoring</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
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
        </TabsContent>
        
        <TabsContent value="errors" className="space-y-6">
          <ErrorMetricsSection
            metrics={analyticsData?.errorMetrics || emptyErrorMetrics}
            overviewMetrics={{
              totalErrors: analyticsData?.overviewMetrics?.totalErrors || 0,
              uniqueUserErrors: analyticsData?.overviewMetrics?.uniqueUserErrors || 0
            }}
            isLoading={isLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
