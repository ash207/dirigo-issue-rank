
import { useState } from "react";
import { Table } from "@/components/ui/table";
import { 
  AnalyticsData,
  UserActivityData,
  RoleDistribution
} from "@/services/analyticsService";
import { ActivityTable } from "./ActivityTable";
import { RolesTable } from "./RolesTable";
import { AnalyticsTableFilters } from "./AnalyticsTableFilters";
import { useSortableData } from "../hooks/useSortableData";

interface AnalyticsDataTableProps {
  data: AnalyticsData | null;
  isLoading: boolean;
}

export function AnalyticsDataTable({ data, isLoading }: AnalyticsDataTableProps) {
  const [activeTab, setActiveTab] = useState<'activity' | 'roles'>('activity');
  const [searchTerm, setSearchTerm] = useState("");

  // Filter data based on search term
  const filteredActivity = data?.userActivity.filter(item => 
    item.date.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const filteredRoles = data?.roleDistribution.filter(item => 
    item.role.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Set up sorting
  const {
    items: sortedActivity,
    requestSort: requestActivitySort,
    sortConfig: activitySortConfig
  } = useSortableData<UserActivityData>(
    filteredActivity, 
    { key: 'date', direction: 'desc' }
  );

  const {
    items: sortedRoles,
    requestSort: requestRolesSort,
    sortConfig: rolesSortConfig
  } = useSortableData<RoleDistribution>(
    filteredRoles, 
    { key: 'count', direction: 'desc' }
  );

  if (isLoading) {
    return (
      <div className="mt-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="h-10 bg-gray-200 rounded w-full mb-4"></div>
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mt-6 text-center p-6 border rounded">
        <p className="text-muted-foreground">No data available</p>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-4">
      <AnalyticsTableFilters
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

      <Table>
        {activeTab === 'activity' ? (
          <ActivityTable 
            data={sortedActivity} 
            sortConfig={activitySortConfig}
            onSort={requestActivitySort}
          />
        ) : (
          <RolesTable 
            data={sortedRoles} 
            sortConfig={rolesSortConfig}
            onSort={requestRolesSort}
          />
        )}
      </Table>
    </div>
  );
}
