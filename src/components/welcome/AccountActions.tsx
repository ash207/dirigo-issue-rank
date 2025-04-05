
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { checkUserExists } from "@/services/auth/signup/userExistence";
import { supabase } from "@/integrations/supabase/client";

interface AccountActionsProps {
  email: string;
  tokenProcessed: boolean;
  isProcessingToken: boolean;
}

const AccountActions = ({ email, tokenProcessed, isProcessingToken }: AccountActionsProps) => {
  const [isChecking, setIsChecking] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const handleCheckAccount = async () => {
    if (!email) {
      toast({
        title: "Error",
        description: "No email address available to check",
        variant: "destructive"
      });
      return;
    }
    
    setIsChecking(true);
    
    try {
      const exists = await checkUserExists(email);
      
      if (exists) {
        toast({
          title: "Account Found",
          description: "We detected that your account exists. Please check your email or try signing in."
        });
      } else {
        toast({
          title: "No Account Found",
          description: "We couldn't find an account with this email. Please try signing up again."
        });
      }
    } catch (err) {
      console.error("Error checking account:", err);
      toast({
        title: "Error",
        description: "Could not check account status. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsChecking(false);
    }
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
      const redirectUrl = `${window.location.origin}/welcome`;
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: redirectUrl
        }
      });
      
      if (error) {
        console.error("Error resending verification:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to resend verification email",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Verification Email Sent",
          description: "A new verification email has been sent. Please check your inbox."
        });
      }
    } catch (err: any) {
      console.error("Unexpected error resending verification:", err);
      toast({
        title: "Error",
        description: err.message || "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsResending(false);
    }
  };

  if (!email || tokenProcessed || isProcessingToken) {
    return null;
  }

  return (
    <>
      <Button 
        variant="outline" 
        onClick={handleCheckAccount}
        disabled={isChecking || isProcessingToken}
      >
        {isChecking ? "Checking..." : "Check Account Status"}
      </Button>
      <Button 
        variant="outline" 
        onClick={handleResendVerification}
        disabled={isResending || isProcessingToken}
      >
        {isResending ? "Sending..." : "Resend Verification Email"}
      </Button>
    </>
  );
};

export default AccountActions;
