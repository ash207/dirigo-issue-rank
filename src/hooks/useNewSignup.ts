
import { useState } from "react";
import { validateSignupForm } from "@/utils/emailValidation";
import { emailExists } from "@/services/auth/signup/emailExists";
import { createUser } from "@/services/auth/signup/createUser";
import { toast } from "@/hooks/use-toast";

export function useNewSignup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    
    // Client-side validation
    const validationError = validateSignupForm(email, password, confirmPassword);
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }
    
    try {
      // Check if email already exists
      setIsCheckingEmail(true);
      const emailAlreadyExists = await emailExists(email);
      setIsCheckingEmail(false);
      
      if (emailAlreadyExists) {
        setErrorMessage("An account with this email already exists. Please try signing in.");
        return;
      }
      
      // Create new user
      setIsLoading(true);
      const success = await createUser(email, password);
      
      if (success) {
        resetForm();
        // We show the success toast in the createUser function
      }
    } catch (err: any) {
      console.error("Signup error:", err);
      setErrorMessage(err.message || "An unexpected error occurred");
      toast({
        title: "Error",
        description: err.message || "Failed to create account",
        variant: "destructive",
      });
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
    errorMessage,
    handleSubmit,
    resetForm
  };
}
