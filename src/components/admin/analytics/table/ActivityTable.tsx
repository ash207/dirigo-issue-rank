
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserActivityData } from "@/services/analyticsService";
import { AnalyticsSortButton } from "./AnalyticsSortButton";

type SortConfig = {
  key: string;
  direction: 'asc' | 'desc';
};

interface ActivityTableProps {
  data: UserActivityData[];
  sortConfig: SortConfig;
  onSort: (key: string) => void;
}

export function ActivityTable({ data, sortConfig, onSort }: ActivityTableProps) {
  return (
    <>
      <TableCaption>User activity over time</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[200px]">
            <AnalyticsSortButton 
              label="Date" 
              sortKey="date" 
              currentSort={sortConfig} 
              onSort={onSort} 
            />
          </TableHead>
          <TableHead>
            <AnalyticsSortButton 
              label="User Count" 
              sortKey="count" 
              currentSort={sortConfig} 
              onSort={onSort} 
            />
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.length > 0 ? (
          data.map((activity, index) => (
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
}
