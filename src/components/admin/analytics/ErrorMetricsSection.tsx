
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AreaChart, BarChart } from "@/components/ui/chart";
import { AlertTriangle, Bug, Terminal, Zap } from "lucide-react";
import { ErrorMetrics } from "@/services/analyticsService";

interface ErrorMetricsSectionProps {
  metrics: ErrorMetrics;
  overviewMetrics: { totalErrors?: number; uniqueUserErrors?: number };
  isLoading: boolean;
}

export function ErrorMetricsSection({ metrics, overviewMetrics, isLoading }: ErrorMetricsSectionProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </CardHeader>
              <CardContent>
                <div className="h-10 bg-gray-200 rounded w-1/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Check if we have error data
  const hasErrorData = 
    (metrics.errorTimeline && metrics.errorTimeline.length > 0) || 
    (metrics.topErrorComponents && metrics.topErrorComponents.length > 0) || 
    (metrics.errorsByType && metrics.errorsByType.length > 0);

  if (!hasErrorData && !overviewMetrics.totalErrors) {
    return (
      <Alert className="my-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>No Error Data Available</AlertTitle>
        <AlertDescription>
          No system errors have been recorded in the selected time period. This is good news!
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-medium">Total Errors</CardTitle>
              <Bug className="h-6 w-6 text-red-500" />
            </div>
            <CardDescription>Total system errors recorded</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{overviewMetrics.totalErrors || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-medium">Users Affected</CardTitle>
              <Zap className="h-6 w-6 text-amber-500" />
            </div>
            <CardDescription>Unique users experiencing errors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{overviewMetrics.uniqueUserErrors || 0}</div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Error Trends</CardTitle>
            <CardDescription>System errors over time</CardDescription>
          </CardHeader>
          <CardContent>
            <AreaChart 
              data={metrics.errorTimeline || []} 
              categories={['count']} 
              index="date"
              valueFormatter={(value: number) => `${value} errors`}
              colors={['red']}
              className="h-[200px] mt-4"
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Errors by Type</CardTitle>
            <CardDescription>Distribution of error types</CardDescription>
          </CardHeader>
          <CardContent>
            {metrics.errorsByType && metrics.errorsByType.length > 0 ? (
              <BarChart 
                data={metrics.errorsByType}
                categories={['count']}
                index="type"
                valueFormatter={(value: number) => `${value} errors`}
                colors={['orange']}
                className="h-[200px] mt-4"
              />
            ) : (
              <div className="flex items-center justify-center h-[200px] text-gray-500">
                No error type data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Most Problematic Components</CardTitle>
          <CardDescription>Components with the highest error rates</CardDescription>
        </CardHeader>
        <CardContent>
          {metrics.topErrorComponents && metrics.topErrorComponents.length > 0 ? (
            <div className="grid gap-4">
              {metrics.topErrorComponents.map((component, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Terminal className="h-4 w-4 mr-2 text-gray-500" />
                    <span>{component.component || 'Unknown'}</span>
                  </div>
                  <span className="font-medium text-red-500">{component.count} errors</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              No component error data available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
