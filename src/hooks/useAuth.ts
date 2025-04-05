
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { 
  checkEmailExists, 
  createUser, 
  SignupState,
  SignupResult
} from "@/services/auth/AuthService";

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
      // Step 1: Check if email exists
      setState(SignupState.CHECKING_EMAIL);
      const emailExists = await checkEmailExists(email);
      
      if (emailExists) {
        setError("An account with this email already exists. Please try signing in.");
        setState(SignupState.ERROR);
        return;
      }
      
      // Step 2: Create user
      setState(SignupState.CREATING_USER);
      const result = await createUser(email, password);
      
      if (result.success) {
        setState(SignupState.SUCCESS);
        resetForm();
        navigate('/welcome', { state: { email } });
      } else {
        setError(result.error || "Failed to create account");
        setState(SignupState.ERROR);
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
