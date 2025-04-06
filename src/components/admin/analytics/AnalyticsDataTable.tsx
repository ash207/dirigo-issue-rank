
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  AnalyticsData,
  RoleDistribution,
  TopIssue,
  UserActivityData 
} from "@/services/analyticsService";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, SortAsc, SortDesc } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";

interface AnalyticsDataTableProps {
  data: AnalyticsData | null;
  isLoading: boolean;
}

type SortConfig = {
  key: string;
  direction: 'asc' | 'desc';
};

export function AnalyticsDataTable({ data, isLoading }: AnalyticsDataTableProps) {
  const [activeTab, setActiveTab] = useState<'activity' | 'roles'>('activity');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ 
    key: activeTab === 'activity' ? 'date' : 'count', 
    direction: 'desc' 
  });
  const [searchTerm, setSearchTerm] = useState("");

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

  const handleSort = (key: string) => {
    setSortConfig({
      key,
      direction: 
        sortConfig.key === key && sortConfig.direction === 'asc'
          ? 'desc'
          : 'asc',
    });
  };

  const renderActivityData = () => {
    let filteredData = [...data.userActivity];
    
    if (searchTerm) {
      filteredData = filteredData.filter(item => 
        item.date.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    const sortedData = [...filteredData].sort((a, b) => {
      if (sortConfig.key === 'date') {
        const comparison = a.date.localeCompare(b.date);
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      } else {
        const comparison = a.count - b.count;
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      }
    });

    return (
      <>
        <TableCaption>User activity over time</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">
              <button 
                className="flex items-center space-x-1"
                onClick={() => handleSort('date')}
              >
                <span>Date</span>
                {sortConfig.key === 'date' && (
                  sortConfig.direction === 'asc' 
                    ? <SortAsc className="h-4 w-4" /> 
                    : <SortDesc className="h-4 w-4" />
                )}
              </button>
            </TableHead>
            <TableHead>
              <button 
                className="flex items-center space-x-1"
                onClick={() => handleSort('count')}
              >
                <span>User Count</span>
                {sortConfig.key === 'count' && (
                  sortConfig.direction === 'asc' 
                    ? <SortAsc className="h-4 w-4" /> 
                    : <SortDesc className="h-4 w-4" />
                )}
              </button>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.length > 0 ? (
            sortedData.map((activity, index) => (
              <TableRow key={index}>
                <TableCell>{new Date(activity.date).toLocaleDateString()}</TableCell>
                <TableCell>{activity.count}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={2} className="text-center h-24">
                No matching data found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </>
    );
  };

  const renderRolesData = () => {
    let filteredData = [...data.roleDistribution];
    
    if (searchTerm) {
      filteredData = filteredData.filter(item => 
        item.role.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    const sortedData = [...filteredData].sort((a, b) => {
      if (sortConfig.key === 'role') {
        const comparison = a.role.localeCompare(b.role);
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      } else {
        const comparison = a.count - b.count;
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      }
    });

    return (
      <>
        <TableCaption>User roles distribution</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">
              <button 
                className="flex items-center space-x-1"
                onClick={() => handleSort('role')}
              >
                <span>Role</span>
                {sortConfig.key === 'role' && (
                  sortConfig.direction === 'asc' 
                    ? <SortAsc className="h-4 w-4" /> 
                    : <SortDesc className="h-4 w-4" />
                )}
              </button>
            </TableHead>
            <TableHead>
              <button 
                className="flex items-center space-x-1"
                onClick={() => handleSort('count')}
              >
                <span>User Count</span>
                {sortConfig.key === 'count' && (
                  sortConfig.direction === 'asc' 
                    ? <SortAsc className="h-4 w-4" /> 
                    : <SortDesc className="h-4 w-4" />
                )}
              </button>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.length > 0 ? (
            sortedData.map((role, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">
                  {role.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </TableCell>
                <TableCell>{role.count}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={2} className="text-center h-24">
                No matching data found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </>
    );
  };

  return (
    <div className="mt-6 space-y-4">
      <div className="flex justify-between items-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              {activeTab === 'activity' ? 'User Activity' : 'User Roles'}
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Select data to view</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => setActiveTab('activity')}>
              User Activity
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setActiveTab('roles')}>
              User Roles
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Input
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Table>
        {activeTab === 'activity' ? renderActivityData() : renderRolesData()}
      </Table>
    </div>
  );
}
