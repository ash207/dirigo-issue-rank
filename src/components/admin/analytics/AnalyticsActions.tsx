
import { Button } from "@/components/ui/button";
import { Download, RefreshCw } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { AnalyticsData, downloadAnalyticsData } from "@/services/analyticsService";

interface AnalyticsActionsProps {
  data: AnalyticsData | null;
  onRefresh: () => void;
  isLoading: boolean;
}

export function AnalyticsActions({ data, onRefresh, isLoading }: AnalyticsActionsProps) {
  const handleDownload = (format: 'csv' | 'json') => {
    if (data) {
      downloadAnalyticsData(data, format);
    }
  };

  return (
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
      <div className="flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              size="sm"
              disabled={!data || isLoading}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => handleDownload('csv')}>
              Download as CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDownload('json')}>
              Download as JSON
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
