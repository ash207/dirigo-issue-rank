
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import PositionAuthForm from "./auth/PositionAuthForm";
import PositionReportForm from "./report/PositionReportForm";
import { usePositionReport } from "./report/usePositionReport";

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
    handleBackToReport
  } = usePositionReport(
    positionId,
    positionTitle,
    positionContent,
    issueId,
    issueTitle,
    () => onOpenChange(false)
  );

  // Render sign-in form
  if (isSigningIn && !isAuthenticated) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sign in to submit report</DialogTitle>
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Report Position</DialogTitle>
        </DialogHeader>
        <PositionReportForm
          onSubmit={handleSubmitReport}
          isSubmitting={isSubmitting}
          isAuthenticated={isAuthenticated}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ReportPositionDialog;
