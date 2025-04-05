
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TimeoutDialogContent } from "./timeout/TimeoutDialogContent";
import { TimeoutDialogActions } from "./timeout/TimeoutDialogActions";
import { useTimeoutDialogActions } from "@/hooks/useTimeoutDialogActions";

interface TimeoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRetry: () => void;
  email?: string;
}

export const TimeoutDialog = ({ open, onOpenChange, onRetry, email }: TimeoutDialogProps) => {
  const {
    isResending,
    isChecking,
    handleClose,
    handleCheckAccount,
    handleResendVerification
  } = useTimeoutDialogActions({ email, onOpenChange });
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Email Verification Timeout</DialogTitle>
          <DialogDescription>
            Our system experienced a timeout while trying to send your verification email.
          </DialogDescription>
        </DialogHeader>
        
        <TimeoutDialogContent email={email} />
        
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <TimeoutDialogActions
            isChecking={isChecking}
            isResending={isResending}
            email={email}
            onClose={handleClose}
            onCheckAccount={handleCheckAccount}
            onResendVerification={handleResendVerification}
            onRetry={onRetry}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
