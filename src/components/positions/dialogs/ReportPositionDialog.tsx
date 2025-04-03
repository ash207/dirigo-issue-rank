
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ReportPositionDialogProps {
  positionId: string;
  positionTitle: string;
  positionContent: string;
  issueId?: string;
  issueTitle?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ReportPositionDialog = ({
  positionId,
  positionTitle,
  positionContent,
  issueId,
  issueTitle = "this issue",
  open,
  onOpenChange
}: ReportPositionDialogProps) => {
  const { isAuthenticated, signIn } = useAuth();
  const [reportReason, setReportReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReport = async () => {
    if (!isAuthenticated) {
      // Redirect to sign in page
      window.location.href = "/sign-in";
      return;
    }
    
    if (!reportReason.trim()) {
      toast.error("Please provide a reason for reporting this position");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.functions.invoke("send-position-report", {
        body: {
          positionId,
          positionTitle,
          positionContent,
          issueId,
          issueTitle,
          reportReason,
        },
      });

      if (error) throw error;

      toast.success("Report submitted successfully");
      setReportReason("");
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error submitting report:", error);
      toast.error("Failed to submit report. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Report Position</DialogTitle>
          <DialogDescription>
            Please explain why you're reporting this position. Our team will review your report.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <Textarea 
            placeholder="Please describe why you're reporting this position..."
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            className="min-h-[100px]"
          />
        </div>
        <DialogFooter className="sm:justify-between">
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={isSubmitting}>
              Cancel
            </Button>
          </DialogClose>
          <Button onClick={handleReport} disabled={isSubmitting}>
            {isAuthenticated 
              ? (isSubmitting ? "Submitting..." : "Submit Report") 
              : "Sign in to Submit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReportPositionDialog;
