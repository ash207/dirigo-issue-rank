
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export interface SignupState {
  email: string;
  password: string;
  confirmPassword: string;
  isLoading: boolean;
  errorMessage: string | null;
  showTimeoutDialog: boolean;
}

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

  // Validate form fields
  const validateSignupForm = (
    email: string, 
    password: string, 
    confirmPassword: string
  ): string | null => {
    if (!email) return "Email is required";
    if (!password) return "Password is required";
    if (password.length < 6) return "Password must be at least 6 characters";
    if (password !== confirmPassword) return "Passwords do not match";
    return null;
  };

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
      // Create user with Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/welcome`,
        }
      });
      
      if (error) {
        // Handle timeouts
        if (error.status === 504 || error.message?.includes("timeout")) {
          setShowTimeoutDialog(true);
          setErrorMessage("Request timed out. Your account may have been created. Please check your email or try signing in.");
        } 
        // Handle existing users
        else if (error.message?.includes("already") || error.message?.includes("exists")) {
          setErrorMessage("An account with this email already exists. Please try signing in.");
        } 
        // Handle other errors
        else {
          setErrorMessage(error.message || "Failed to create account");
        }
      } else if (data.user) {
        // Success
        toast.success("Account created successfully! Please check your email for verification.");
        
        // Navigate to the email sent page with the email in the state
        navigate('/email-sent', { state: { email } });
      }
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
