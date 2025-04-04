
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import AuthForm from "./auth/AuthForm";
import ReportForm from "./report/ReportForm";
import { useReport } from "./report/useReport";
import { useEffect } from "react";

interface ReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  issueId: string;
  issueTitle: string;
}

const ReportModal = ({ open, onOpenChange, issueId, issueTitle }: ReportModalProps) => {
  const {
    isSubmitting,
    isAuthenticated,
    isSigningIn,
    authError,
    showAuthSuccess,
    handleSubmitReport,
    handleSignIn,
    handleBackToReport,
    setIsSigningIn,
    resetState
  } = useReport(issueId, issueTitle, () => {
    onOpenChange(false);
  });

  // Reset internal state when modal is closed
  useEffect(() => {
    if (!open) {
      resetState();
      // Ensure body has pointer-events restored
      document.body.style.removeProperty('pointer-events');
    }
  }, [open, resetState]);

  // Render sign-in form
  if (isSigningIn && !isAuthenticated) {
    return (
      <Dialog open={open} onOpenChange={(newOpen) => {
        if (!newOpen) {
          document.body.style.removeProperty('pointer-events');
        }
        onOpenChange(newOpen);
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sign in to submit report</DialogTitle>
            <DialogDescription>
              Authentication is required to submit reports to prevent abuse.
            </DialogDescription>
          </DialogHeader>
          
          <AuthForm
            onSignIn={handleSignIn}
            onBack={handleBackToReport}
            isSubmitting={isSubmitting}
            authError={authError}
            showAuthSuccess={showAuthSuccess}
          />
        </DialogContent>
      </Dialog>
    );
  }

  // Render report form
  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (!newOpen) {
        document.body.style.removeProperty('pointer-events');
      }
      onOpenChange(newOpen);
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Report Issue</DialogTitle>
          <DialogDescription>
            Please provide details about why you're reporting this issue.
          </DialogDescription>
        </DialogHeader>
        <ReportForm
          onSubmit={handleSubmitReport}
          isSubmitting={isSubmitting}
          isAuthenticated={isAuthenticated}
          onSignInClick={() => setIsSigningIn(true)}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ReportModal;
