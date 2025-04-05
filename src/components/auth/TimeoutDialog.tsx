
import { Button } from "@/components/ui/button";
import { AlertDescription } from "@/components/ui/alert";
import { Alert } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Info, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface TimeoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRetry: () => void;
}

export const TimeoutDialog = ({ open, onOpenChange, onRetry }: TimeoutDialogProps) => {
  const navigate = useNavigate();
  
  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Server Timeout Information</DialogTitle>
          <DialogDescription>
            Due to high demand, the server is experiencing timeouts during account creation.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Alert>
            <Info className="h-4 w-4 mr-2" />
            <AlertDescription>
              <strong>Important:</strong> Even when you see a timeout, your account may have been successfully created. 
              Check your email for a verification link before trying again.
            </AlertDescription>
          </Alert>
          <p>What you can do now:</p>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Check your inbox (and spam folder) for a verification email</li>
            <li>Try to sign in with the credentials you just used</li>
            <li>Wait a few minutes before trying to sign up again</li>
          </ol>
        </div>
        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={handleClose}>
            Close
          </Button>
          <div className="space-x-2">
            <Button variant="outline" onClick={onRetry}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            <Button onClick={() => {
              handleClose();
              navigate("/sign-in");
            }}>
              Go to Sign In
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
