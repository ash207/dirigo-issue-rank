
import { AuthResponse } from "@/types/auth";
import { toast } from "@/hooks/use-toast";
import { NavigateFunction } from "react-router-dom";

interface SignupResponseHandlerParams {
  result: AuthResponse;
  email: string;
  navigate: NavigateFunction;
  setErrorMessage: (message: string | null) => void;
  setShowTimeoutDialog: (show: boolean) => void;
}

/**
 * Handles the response from a signup attempt and manages UI state accordingly
 * @returns true if an error occurred that should prevent completion
 */
export function handleSignupResponse({
  result,
  email,
  navigate,
  setErrorMessage,
  setShowTimeoutDialog
}: SignupResponseHandlerParams): boolean {
  const { data, error } = result;
  
  if (error) {
    console.log("Final signup error:", error.code, error.message);
    
    // Special handling for timeout errors
    if (error.code === 'email_timeout' || error.message?.includes("timeout")) {
      setShowTimeoutDialog(true);
      return true;
    }
    
    if (error.code === 'max_retries') {
      // Already handled above by showing the timeout dialog
      return true;
    }
    
    if (error.code === 'user_exists') {
      // User already exists - this is actually a good thing
      toast({
        title: "Account already exists",
        description: "An account with this email already exists. Please check your email or try signing in.",
      });
      navigate("/welcome", { state: { email } });
      return true;
    }
    
    setErrorMessage(error.message || "An error occurred during signup");
    return true;
  }
  
  // Show success message
  toast({
    title: "Account created",
    description: "Please check your email for verification instructions",
  });
  
  // Redirect to welcome page or show success state
  navigate("/welcome", { state: { email } });
  return false;
}
