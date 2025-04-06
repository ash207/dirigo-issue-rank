
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RoleDistribution } from "@/services/analyticsService";
import { AnalyticsSortButton } from "./AnalyticsSortButton";

type SortConfig = {
  key: string;
  direction: 'asc' | 'desc';
};

interface RolesTableProps {
  data: RoleDistribution[];
  sortConfig: SortConfig;
  onSort: (key: string) => void;
}

export function RolesTable({ data, sortConfig, onSort }: RolesTableProps) {
  return (
    <>
      <TableCaption>User roles distribution</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[200px]">
            <AnalyticsSortButton 
              label="Role" 
              sortKey="role" 
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
          data.map((role, index) => (
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
}
