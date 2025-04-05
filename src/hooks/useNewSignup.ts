
import { useState } from "react";
import { validateSignupForm } from "@/utils/emailValidation";
import { emailExists } from "@/services/auth/signup/emailExists";
import { createUser } from "@/services/auth/signup/createUser";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export function useNewSignup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();

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
      // Step 1: Check if email already exists
      setIsCheckingEmail(true);
      console.log(`Checking if email exists: ${email}`);
      const emailAlreadyExists = await emailExists(email);
      setIsCheckingEmail(false);
      
      console.log(`Email exists check result: ${emailAlreadyExists}`);
      
      // Step 2: If email exists, stop and inform user
      if (emailAlreadyExists) {
        setErrorMessage("An account with this email already exists. Please try signing in.");
        toast({
          title: "Account Exists",
          description: "An account with this email already exists. Please try signing in.",
          variant: "destructive",
        });
        return;
      }
      
      // Step 3: Only if email doesn't exist, proceed with user creation
      setIsLoading(true);
      const success = await createUser(email, password);
      
      if (success) {
        resetForm();
        navigate('/welcome', { state: { email } });
        // Toast notification is shown in the createUser function
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
