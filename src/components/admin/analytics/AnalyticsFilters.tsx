
import { useState, useEffect } from "react";
import { DateRange } from "@/services/analyticsService";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface AnalyticsFiltersProps {
  onFilterChange: (filter: { 
    dateRange: DateRange; 
    startDate?: string; 
    endDate?: string;
  }) => void;
  isLoading: boolean;
}

export function AnalyticsFilters({ onFilterChange, isLoading }: AnalyticsFiltersProps) {
  const [dateRange, setDateRange] = useState<DateRange>('week');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  const handleRangeChange = (value: string) => {
    const range = value as DateRange;
    setDateRange(range);
    
    // Clear custom dates if not using custom range
    if (range !== 'custom') {
      setStartDate(undefined);
      setEndDate(undefined);
      
      // Immediately trigger filter change for non-custom ranges
      onFilterChange({ 
        dateRange: range 
      });
    }
  };

  const handleStartDateChange = (date: Date | undefined) => {
    setStartDate(date);
    if (date && endDate) {
      applyCustomDateRange();
    }
  };

  const handleEndDateChange = (date: Date | undefined) => {
    setEndDate(date);
    if (startDate && date) {
      applyCustomDateRange();
    }
  };

  const applyCustomDateRange = () => {
    if (startDate && endDate) {
      onFilterChange({
        dateRange: 'custom',
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: format(endDate, 'yyyy-MM-dd')
      });
    }
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end mb-6">
      <div className="grid gap-2">
        <label htmlFor="date-range" className="text-sm font-medium">
          Date Range
        </label>
        <Select
          value={dateRange}
          onValueChange={handleRangeChange}
          disabled={isLoading}
        >
          <SelectTrigger id="date-range" className="w-[180px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">Last 7 days</SelectItem>
            <SelectItem value="month">Last 30 days</SelectItem>
            <SelectItem value="year">Last 365 days</SelectItem>
            <SelectItem value="custom">Custom range</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {dateRange === 'custom' && (
        <>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Start Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[180px] justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                  disabled={isLoading}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={handleStartDateChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">End Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[180px] justify-start text-left font-normal",
                    !endDate && "text-muted-foreground"
                  )}
                  disabled={isLoading}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={handleEndDateChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <Button 
            onClick={applyCustomDateRange} 
            disabled={!startDate || !endDate || isLoading}
          >
            Apply
          </Button>
        </>
      )}
    </div>
  );
}
