
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthResponse, SignupState } from "@/types/auth";
import { validateSignupForm } from "@/utils/authValidation";
import { handleSignupWithRetry } from "@/utils/signupRetryHandler";
import { handleSignupResponse } from "@/utils/signupResponseHandler";

interface UseSignupReturn extends SignupState {
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  setConfirmPassword: (confirmPassword: string) => void;
  setShowTimeoutDialog: (show: boolean) => void;
  isCheckingExistingUser: boolean;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleRetry: () => void;
}

export function useSignup(): UseSignupReturn {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showTimeoutDialog, setShowTimeoutDialog] = useState(false);
  const [isCheckingExistingUser, setIsCheckingExistingUser] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset error state
    setErrorMessage(null);
    
    // Validate form
    const validationError = validateSignupForm(email, password, confirmPassword);
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await handleSignupWithRetry(email, password);
      
      // Handle the case where result might be undefined
      if (!result) {
        setErrorMessage("An unknown error occurred during signup");
        setIsLoading(false);
        return;
      }
      
      // Process the signup response
      handleSignupResponse({
        result,
        email,
        navigate,
        setErrorMessage,
        setShowTimeoutDialog
      });
      
    } catch (err: any) {
      console.error("Unexpected error during signup:", err);
      setErrorMessage(err.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    // Reset error message when user wants to retry
    setErrorMessage(null);
    setShowTimeoutDialog(false);
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    isLoading,
    errorMessage,
    showTimeoutDialog,
    setShowTimeoutDialog,
    isCheckingExistingUser,
    handleSubmit,
    handleRetry
  };
}
