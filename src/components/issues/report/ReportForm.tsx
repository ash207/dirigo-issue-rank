
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";

interface ReportFormProps {
  onSubmit: (reason: string) => Promise<void>;
  isSubmitting: boolean;
  isAuthenticated: boolean;
}

const ReportForm = ({ onSubmit, isSubmitting, isAuthenticated }: ReportFormProps) => {
  const [reason, setReason] = useState("");

  const handleSubmit = async () => {
    if (reason.trim()) {
      await onSubmit(reason);
    }
  };

  return (
    <div className="space-y-4 pt-2">
      <Textarea 
        placeholder="Please describe why you're reporting this issue..."
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        className="min-h-[100px]"
        disabled={!isAuthenticated}
      />
      {!isAuthenticated && (
        <p className="text-sm text-muted-foreground">
          You must sign in to submit a report
        </p>
      )}
      <DialogFooter className="sm:justify-between">
        <DialogClose asChild>
          <Button type="button" variant="outline" disabled={isSubmitting}>
            Cancel
          </Button>
        </DialogClose>
        <Button onClick={handleSubmit} disabled={isSubmitting || !reason.trim()}>
          {isAuthenticated 
            ? (isSubmitting ? "Submitting..." : "Submit Report") 
            : "Sign in to Submit"}
        </Button>
      </DialogFooter>
    </div>
  );
};

export default ReportForm;
