
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthError } from "@supabase/supabase-js";
import { 
  signInWithEmail, 
  signUpWithEmail,
  sendPasswordResetEmail
} from "@/services/auth/newAuthService";
import { emailExists } from "@/services/auth/signup/emailExists";

export function useEmailAuth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setError(null);
  };

  const validateSignUp = () => {
    if (!email) return "Email is required";
    if (!password) return "Password is required";
    if (password !== confirmPassword) return "Passwords do not match";
    if (password.length < 6) return "Password must be at least 6 characters";
    return null;
  };

  const handleSignIn = async () => {
    if (!email) return setError("Email is required");
    if (!password) return setError("Password is required");
    
    setError(null);
    setIsLoading(true);
    
    try {
      const { data } = await signInWithEmail(email, password);
      console.log("Sign in successful, redirecting...");
      navigate("/");
      resetForm();
    } catch (err: any) {
      console.error("Error in handleSignIn:", err);
      setError(err.message || "Failed to sign in");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async () => {
    const validationError = validateSignUp();
    if (validationError) return setError(validationError);
    
    setError(null);
    setIsLoading(true);
    
    try {
      // Check if email already exists
      setIsCheckingEmail(true);
      const exists = await emailExists(email);
      setIsCheckingEmail(false);
      
      if (exists) {
        setError("An account with this email already exists. Please sign in instead.");
        setIsLoading(false);
        return;
      }
      
      // Proceed with signup
      const { data } = await signUpWithEmail(email, password);
      console.log("Sign up successful, redirecting to welcome page...");
      navigate("/welcome", { state: { email } });
      resetForm();
    } catch (err: any) {
      console.error("Error in handleSignUp:", err);
      if (err.code === "23505" || err.message?.includes("already exists")) {
        setError("An account with this email already exists. Please sign in instead.");
      } else {
        setError(err.message || "Failed to create account");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) return setError("Email is required");
    
    setError(null);
    setIsLoading(true);
    
    try {
      await sendPasswordResetEmail(email);
      navigate("/check-email", { state: { email } });
    } catch (err: any) {
      console.error("Error in handlePasswordReset:", err);
      setError(err.message || "Failed to send password reset email");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    isLoading,
    isCheckingEmail,
    error,
    setError,
    handleSignIn,
    handleSignUp,
    handlePasswordReset,
    resetForm
  };
}
