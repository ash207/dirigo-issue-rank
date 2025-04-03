
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  issueId: string;
  issueTitle: string;
}

const ReportModal = ({ open, onOpenChange, issueId, issueTitle }: ReportModalProps) => {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast.error("Please provide a reason for reporting this issue");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.functions.invoke("send-report", {
        body: {
          issueId,
          issueTitle,
          reportReason: reason,
        },
      });

      if (error) throw error;

      toast.success("Report submitted successfully");
      setReason("");
      onOpenChange(false);
    } catch (error) {
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
          <DialogTitle>Report Issue</DialogTitle>
          <DialogDescription>
            Please explain why you're reporting this issue. Our team will review your report.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <Textarea 
            placeholder="Please describe why you're reporting this issue..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="min-h-[100px]"
          />
        </div>
        <DialogFooter className="sm:justify-between">
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={isSubmitting}>
              Cancel
            </Button>
          </DialogClose>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Report"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReportModal;
