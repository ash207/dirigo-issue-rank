
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SiteIssue } from "@/hooks/useSiteIssues";
import { formatDistanceToNow } from "date-fns";
import { Edit, Trash } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { SiteIssueDetailsDialog } from "./SiteIssueDetailsDialog";

interface SiteIssuesTableProps {
  issues: SiteIssue[];
  isLoading: boolean;
  onUpdateIssue: (issueId: string, data: Partial<SiteIssue>) => Promise<void>;
}

export function SiteIssuesTable({ issues, isLoading, onUpdateIssue }: SiteIssuesTableProps) {
  const [selectedIssue, setSelectedIssue] = useState<SiteIssue | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  const handleStatusChange = async (issueId: string, newStatus: "open" | "in-progress" | "resolved") => {
    await onUpdateIssue(issueId, { status: newStatus });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <Badge variant="destructive">Open</Badge>;
      case "in-progress":
        return <Badge variant="default" className="bg-amber-500">In Progress</Badge>;
      case "resolved":
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-500">Resolved</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "low":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-500">Low</Badge>;
      case "medium":
        return <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-500">Medium</Badge>;
      case "high":
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-500">High</Badge>;
      case "critical":
        return <Badge variant="destructive">Critical</Badge>;
      default:
        return <Badge variant="outline">{severity}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (issues.length === 0) {
    return (
      <div className="text-center p-10 border rounded-lg">
        <h3 className="text-lg font-medium">No issues reported</h3>
        <p className="text-muted-foreground mt-2">
          There are currently no site issues tracked in the system.
        </p>
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Severity</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Reported</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {issues.map((issue) => (
            <TableRow key={issue.id}>
              <TableCell className="font-medium">
                <button 
                  className="text-left hover:underline focus:outline-none" 
                  onClick={() => {
                    setSelectedIssue(issue);
                    setShowDetailsDialog(true);
                  }}
                >
                  {issue.title}
                </button>
              </TableCell>
              <TableCell>{getSeverityBadge(issue.severity)}</TableCell>
              <TableCell>{getStatusBadge(issue.status)}</TableCell>
              <TableCell>
                {formatDistanceToNow(new Date(issue.created_at), { addSuffix: true })}
              </TableCell>
              <TableCell>
                {formatDistanceToNow(new Date(issue.updated_at || issue.created_at), { addSuffix: true })}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedIssue(issue);
                      setShowDetailsDialog(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      setSelectedIssue(issue);
                      setShowDeleteDialog(true);
                    }}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete issue?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the issue record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={async () => {
                if (selectedIssue) {
                  await onUpdateIssue(selectedIssue.id, { deleted: true });
                  setShowDeleteDialog(false);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {selectedIssue && (
        <SiteIssueDetailsDialog
          issue={selectedIssue}
          open={showDetailsDialog}
          onOpenChange={setShowDetailsDialog}
          onUpdate={onUpdateIssue}
        />
      )}
    </>
  );
}
