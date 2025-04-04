
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const usePositionReport = (
  positionId: string,
  positionTitle: string,
  positionContent: string,
  issueId?: string,
  issueTitle?: string,
  onComplete?: () => void
) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isAuthenticated, signIn, session } = useAuth();
  
  // Sign in state
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authError, setAuthError] = useState("");
  const [showAuthSuccess, setShowAuthSuccess] = useState(false);

  const resetState = useCallback(() => {
    setIsSigningIn(false);
    setAuthError("");
    setShowAuthSuccess(false);
    setIsSubmitting(false);
  }, []);

  const handleSubmitReport = async (reason: string) => {
    if (!isAuthenticated) {
      setIsSigningIn(true);
      return;
    }
    
    if (!reason.trim()) {
      toast.error("Please provide a reason for reporting this position");
      return;
    }

    setIsSubmitting(true);

    try {
      // We need to pass the auth token for the edge function to identify the user
      const { error } = await supabase.functions.invoke("send-position-report", {
        body: {
          positionId,
          positionTitle,
          positionContent,
          issueId,
          issueTitle,
          reportReason: reason,
        },
        headers: session?.access_token
          ? { Authorization: `Bearer ${session.access_token}` }
          : undefined,
      });

      if (error) throw error;

      toast.success("Report submitted successfully");
      // Ensure we call onComplete to close the modal
      if (onComplete) onComplete();
    } catch (error) {
      console.error("Error submitting report:", error);
      toast.error("Failed to submit report. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignIn = async (email: string, password: string) => {
    setIsSubmitting(true);
    setAuthError("");
    
    try {
      await signIn(email, password);
      setShowAuthSuccess(true);
      
      // Show success message briefly then return to report form
      setTimeout(() => {
        setShowAuthSuccess(false);
        setIsSigningIn(false);
      }, 2000);
    } catch (error: any) {
      setAuthError(error.message || "Failed to sign in");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleBackToReport = () => {
    setIsSigningIn(false);
    setAuthError("");
  };

  return {
    isSubmitting,
    isAuthenticated,
    isSigningIn,
    setIsSigningIn,
    authError,
    showAuthSuccess,
    handleSubmitReport,
    handleSignIn,
    handleBackToReport,
    resetState
  };
};
