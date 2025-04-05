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
      
      // Add a timeout to the request
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Resend request timed out after 8 seconds'));
        }, 8000); // Use 8s timeout to detect server timeouts early
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

  return {
    isResending,
    isChecking,
    handleClose,
    handleCheckAccount,
    handleResendVerification
  };
}
