
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { checkUserExists } from "@/services/auth/signup/userExistence";

interface UseTimeoutDialogActionsProps {
  email?: string;
  onOpenChange: (open: boolean) => void;
}

export function useTimeoutDialogActions({ email, onOpenChange }: UseTimeoutDialogActionsProps) {
  const [isResending, setIsResending] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  
  const handleClose = () => {
    onOpenChange(false);
  };

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
      // Always use the production domain for redirect
      const redirectUrl = `https://dirigovotes.com/welcome`;
      console.log(`Resending verification with redirect URL: ${redirectUrl}`);
      
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
        console.log("Verification email resent successfully");
        toast({
          title: "Verification Email Sent",
          description: "A new verification email has been sent. Please check your inbox."
        });
        onOpenChange(false);
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

  return {
    isResending,
    isChecking,
    handleClose,
    handleCheckAccount,
    handleResendVerification
  };
}
