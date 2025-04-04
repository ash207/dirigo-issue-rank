
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import PositionAuthForm from "./auth/PositionAuthForm";
import PositionReportForm from "./report/PositionReportForm";
import { usePositionReport } from "./report/usePositionReport";
import { useEffect } from "react";

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
  } = usePositionReport(
    positionId,
    positionTitle,
    positionContent,
    issueId,
    issueTitle,
    () => onOpenChange(false)
  );

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
          
          <PositionAuthForm
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
          <DialogTitle>Report Position</DialogTitle>
          <DialogDescription>
            Please provide details about why you're reporting this position.
          </DialogDescription>
        </DialogHeader>
        <PositionReportForm
          onSubmit={handleSubmitReport}
          isSubmitting={isSubmitting}
          isAuthenticated={isAuthenticated}
          onSignInClick={() => setIsSigningIn(true)}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ReportPositionDialog;
