
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Define the SignupState enum since AuthService was removed
export enum SignupState {
  IDLE = "idle",
  CHECKING_EMAIL = "checking_email",
  CREATING_USER = "creating_user",
  SUCCESS = "success",
  ERROR = "error"
}

export function useAuth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [state, setState] = useState<SignupState>(SignupState.IDLE);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Reset the form
  const resetForm = useCallback(() => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setError(null);
    setState(SignupState.IDLE);
  }, []);

  // Handle signup
  const handleSignup = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    
    // Validate form
    if (!email) {
      setError("Email is required");
      return;
    }
    
    if (!password) {
      setError("Password is required");
      return;
    }
    
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    
    try {
      // Immediately attempt to sign up without checking email existence first
      setState(SignupState.CREATING_USER);
      
      // Create user with signUp method
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/welcome`,
          data: {
            email_confirmed: true, // Skip email confirmation
          }
        }
      });
      
      if (error) {
        // Handle existing user error
        if (error.message?.toLowerCase().includes("already") || 
            error.message?.toLowerCase().includes("exists")) {
          toast({
            title: "Account Already Exists",
            description: "An account with this email already exists. Please try signing in.",
          });
          
          setState(SignupState.SUCCESS);
          navigate('/sign-in', { state: { email } });
          return;
        }
        
        // Handle other errors
        console.error("Signup error:", error);
        setError(error.message || "Failed to create account");
        setState(SignupState.ERROR);
        return;
      }
      
      // Successfully created user or email already exists
      if (data && data.user) {
        setState(SignupState.SUCCESS);
        resetForm();
        toast({
          title: "Account Created",
          description: "Your account has been created. Please check your email for verification.",
        });
        navigate('/email-sent', { state: { email } });
      }
    } catch (err: any) {
      console.error("Signup error:", err);
      setError(err.message || "An unexpected error occurred");
      setState(SignupState.ERROR);
    }
  }, [email, password, confirmPassword, navigate, resetForm]);

  return {
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    state,
    error,
    isLoading: state === SignupState.CHECKING_EMAIL || state === SignupState.CREATING_USER,
    isCheckingEmail: state === SignupState.CHECKING_EMAIL,
    isCreatingUser: state === SignupState.CREATING_USER,
    handleSignup,
    resetForm
  };
}
