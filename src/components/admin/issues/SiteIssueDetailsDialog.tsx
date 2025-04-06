
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SiteIssue } from "@/hooks/useSiteIssues";
import { SiteIssueForm } from "./SiteIssueForm";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface SiteIssueDetailsDialogProps {
  issue: SiteIssue;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (issueId: string, data: Partial<SiteIssue>) => Promise<void>;
}

export function SiteIssueDetailsDialog({
  issue,
  open,
  onOpenChange,
  onUpdate,
}: SiteIssueDetailsDialogProps) {
  const handleSubmit = async (data: Partial<SiteIssue>) => {
    await onUpdate(issue.id, data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Issue Details</span>
            <Badge 
              variant="outline" 
              className={
                issue.status === "resolved" 
                  ? "bg-green-100 text-green-800 border-green-500" 
                  : issue.status === "in-progress" 
                    ? "bg-amber-100 text-amber-800 border-amber-500"
                    : "bg-red-100 text-red-800 border-red-500"
              }
            >
              {issue.status === "in-progress" ? "In Progress" : 
               issue.status.charAt(0).toUpperCase() + issue.status.slice(1)}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Reported on {format(new Date(issue.created_at), "PPP 'at' p")}
            {issue.updated_at && issue.updated_at !== issue.created_at && 
              ` • Last updated ${format(new Date(issue.updated_at), "PPP 'at' p")}`}
          </DialogDescription>
        </DialogHeader>
        <SiteIssueForm issue={issue} onSubmit={handleSubmit} />
      </DialogContent>
    </Dialog>
  );
}
