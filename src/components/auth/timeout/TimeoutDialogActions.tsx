
import { Button } from "@/components/ui/button";
import { Info, RefreshCw, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface TimeoutDialogActionsProps {
  isChecking: boolean;
  isResending: boolean;
  email?: string;
  onClose: () => void;
  onCheckAccount: () => void;
  onResendVerification: () => void;
  onRetry: () => void;
}

export const TimeoutDialogActions = ({
  isChecking,
  isResending,
  email,
  onClose,
  onCheckAccount,
  onResendVerification,
  onRetry
}: TimeoutDialogActionsProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <Button variant="outline" onClick={onClose} className="sm:mr-auto">
        Close
      </Button>
      <div className="flex flex-col sm:flex-row gap-2">
        {email && (
          <>
            <Button 
              variant="secondary" 
              onClick={onCheckAccount}
              disabled={isChecking}
            >
              <Info className="mr-2 h-4 w-4" />
              {isChecking ? "Checking..." : "Check Account"}
            </Button>
            <Button 
              variant="secondary" 
              onClick={onResendVerification}
              disabled={isResending}
            >
              <Mail className="mr-2 h-4 w-4" />
              {isResending ? "Sending..." : "Resend Verification"}
            </Button>
          </>
        )}
        <Button variant="outline" onClick={onRetry}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
        <Button onClick={() => {
          onClose();
          navigate("/sign-in");
        }}>
          Go to Sign In
        </Button>
      </div>
    </div>
  );
};
