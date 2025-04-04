
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "./StatusBadge";
import { PositionReport } from "@/hooks/useReports";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface PositionReportsTableProps {
  reports: PositionReport[];
  isLoading: boolean;
}

export const PositionReportsTable = ({ reports, isLoading }: PositionReportsTableProps) => {
  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No position reports found</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Position</TableHead>
          <TableHead>Issue</TableHead>
          <TableHead>Reason</TableHead>
          <TableHead>Reporter</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {reports.map((report) => (
          <TableRow key={report.id}>
            <TableCell className="font-medium whitespace-nowrap">
              {format(new Date(report.created_at), 'MMM d, yyyy')}
            </TableCell>
            <TableCell className="max-w-xs truncate">
              {report.position_title}
            </TableCell>
            <TableCell className="max-w-xs truncate">
              {report.issue_title}
            </TableCell>
            <TableCell className="max-w-sm truncate">
              {report.report_reason}
            </TableCell>
            <TableCell>{report.reporter_email || 'Unknown'}</TableCell>
            <TableCell><StatusBadge status={report.status} /></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
