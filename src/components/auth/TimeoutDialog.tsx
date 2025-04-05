
import { Button } from "@/components/ui/button";
import { AlertDescription } from "@/components/ui/alert";
import { Alert } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Info, RefreshCw, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface TimeoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRetry: () => void;
  email?: string;
}

export const TimeoutDialog = ({ open, onOpenChange, onRetry, email }: TimeoutDialogProps) => {
  const navigate = useNavigate();
  const [isResending, setIsResending] = useState(false);
  
  const handleClose = () => {
    onOpenChange(false);
  };

  const handleResendVerification = async () => {
    if (!email) {
      toast({
        title: "Error",
        description: "No email address available for verification",
        variant: "destructive"
      });
      return;
    }

    setIsResending(true);
    
    try {
      // Always use the production domain for redirect
      const redirectUrl = `https://dirigovotes.com/welcome`;
      console.log(`Resending verification with redirect URL: ${redirectUrl}`);
      
      // Add a timeout to the request
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Resend request timed out after 10 seconds'));
        }, 10000);
      });
      
      const resendPromise = supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: redirectUrl
        }
      });
      
      // Race the two promises
      const { error } = await Promise.race([
        resendPromise,
        timeoutPromise.then(() => {
          throw new Error('Resend request timed out');
        })
      ]) as Awaited<ReturnType<typeof supabase.auth.resend>>;
      
      if (error) {
        console.error("Error resending verification:", error);
        
        // Check if it's a timeout specifically
        if (error.message?.includes('timeout') || error.status === 504) {
          toast({
            title: "Timeout Error",
            description: "The verification email request timed out. Please try again later or check your inbox as the email might still have been sent.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Error",
            description: error.message || "Failed to resend verification email. Please try again later.",
            variant: "destructive"
          });
        }
      } else {
        console.log("Verification email resent successfully");
        toast({
          title: "Verification Email Sent",
          description: "A new verification email has been sent. Please check your inbox."
        });
        onOpenChange(false);
      }
    } catch (err: any) {
      console.error("Unexpected error resending verification:", err);
      
      // Handle timeout specifically
      if (err.message?.includes('timeout')) {
        toast({
          title: "Timeout Error",
          description: "The verification email request timed out. Please try again later or check your inbox as the email might still have been sent.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error",
          description: err.message || "An unexpected error occurred. Please try again later.",
          variant: "destructive"
        });
      }
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Email Verification Timeout</DialogTitle>
          <DialogDescription>
            Our system experienced a timeout while trying to send your verification email.
          </DialogDescription>
        </DialogHeader>
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
            <li>Use the "Resend Verification" button to try again</li>
            <li>Try signing in with the credentials you just used</li>
            <li>If problems persist, please contact support</li>
          </ol>
        </div>
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={handleClose} className="sm:mr-auto">
            Close
          </Button>
          <div className="flex flex-col sm:flex-row gap-2">
            {email && (
              <Button 
                variant="secondary" 
                onClick={handleResendVerification}
                disabled={isResending}
              >
                <Mail className="mr-2 h-4 w-4" />
                {isResending ? "Sending..." : "Resend Verification"}
              </Button>
            )}
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
