
import { AlertDescription } from "@/components/ui/alert";
import { Alert } from "@/components/ui/alert";
import { Info } from "lucide-react";

interface TimeoutDialogContentProps {
  email?: string;
}

export const TimeoutDialogContent = ({ email }: TimeoutDialogContentProps) => {
  return (
    <div className="space-y-4 py-4">
      <Alert>
        <Info className="h-4 w-4 mr-2" />
        <AlertDescription>
          <strong>Important:</strong> Your account may have been created, but the verification email could not be sent due to server timeouts.
        </AlertDescription>
      </Alert>
      
      {email && (
        <p className="text-sm">
          We attempted to send verification to: <strong>{email}</strong>
        </p>
      )}
      
      <p>What you can do now:</p>
      <ol className="list-decimal pl-5 space-y-2">
        <li>Check your inbox and spam folder for a verification email</li>
        <li>Use the "Check Account" button to see if your account was created</li>
        <li>Use the "Resend Verification" button to try again</li>
        <li>If problems persist, please contact support</li>
      </ol>
    </div>
  );
};
