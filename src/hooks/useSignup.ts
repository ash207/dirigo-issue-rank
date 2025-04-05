
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerNewUser, checkUserExists } from "@/services/newSignupService";
import { toast } from "@/hooks/use-toast";

// Define response type for clarity
export interface AuthResponse {
  data: { user?: { id?: string; email?: string } } | null;
  error: { 
    code?: string; 
    message?: string;
    status?: number;
  } | null;
}

interface UseSignupReturn {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  confirmPassword: string;
  setConfirmPassword: (confirmPassword: string) => void;
  isLoading: boolean;
  errorMessage: string | null;
  showTimeoutDialog: boolean;
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

  // Create a function to handle timeouts with retry logic
  const handleSignupWithRetry = async (retryCount = 0): Promise<AuthResponse> => {
    if (retryCount >= 2) {
      // If we've already retried twice, show the timeout dialog
      setShowTimeoutDialog(true);
      return { 
        data: null,
        error: { 
          code: 'max_retries', 
          message: 'Maximum retry attempts reached' 
        } 
      };
    }
    
    console.log(`Signup attempt for: ${email} with redirect to: https://dirigovotes.com/welcome${retryCount > 0 ? ` (retry ${retryCount})` : ''}`);
    
    try {
      // Check if user already exists before attempting to create (on retries)
      if (retryCount > 0) {
        const exists = await checkUserExists(email);
        if (exists) {
          console.log("User already exists, avoiding duplicate registration");
          return { 
            data: null,
            error: { 
              code: 'user_exists', 
              message: 'An account with this email already exists. Please check your email for verification instructions or try signing in.' 
            } 
          };
        }
      }
      
      const result = await registerNewUser(email, password, "https://dirigovotes.com/welcome") as AuthResponse;
      
      if (result.error) {
        console.log(`Signup error (attempt ${retryCount}):`, result.error);
        
        // If it's a timeout error, retry automatically after a delay
        const isTimeout = 
          result.error.code === 'email_timeout' || 
          result.error.message?.includes('timeout') || 
          result.error.status === 504;
          
        if (isTimeout) {
          console.log(`Retrying signup automatically (attempt ${retryCount + 1})`);
          
          // Increase delay for each retry attempt
          const delayMs = (retryCount + 1) * 2000;
          console.log(`Waiting ${delayMs}ms before retry`);
          
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, delayMs));
          
          // Check if user was created during timeout
          const exists = await checkUserExists(email);
          if (exists) {
            console.log("User was created despite timeout, redirecting to welcome page");
            return { data: { user: { email } }, error: null };
          }
          
          // Retry with incremented count
          return handleSignupWithRetry(retryCount + 1);
        }
      }
      
      return result;
    } catch (err: any) {
      console.error(`Unexpected error during signup (attempt ${retryCount}):`, err);
      return { 
        data: null,
        error: { 
          code: 'signup_error',
          message: err.message || 'An unexpected error occurred' 
        } 
      };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset error state
    setErrorMessage(null);
    
    // Basic validation
    if (!email || !password) {
      setErrorMessage("Please fill in all fields");
      return;
    }
    
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }
    
    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await handleSignupWithRetry();
      
      // Handle the case where result might be undefined
      if (!result) {
        setErrorMessage("An unknown error occurred during signup");
        setIsLoading(false);
        return;
      }
      
      const { data, error } = result;
      
      if (error) {
        console.log("Final signup error:", error.code, error.message);
        
        // Special handling for timeout errors
        if (error.code === 'email_timeout' || error.message?.includes("timeout")) {
          setShowTimeoutDialog(true);
          setIsLoading(false);
          return;
        }
        
        if (error.code === 'max_retries') {
          // Already handled above by showing the timeout dialog
          setIsLoading(false);
          return;
        }
        
        if (error.code === 'user_exists') {
          // User already exists - this is actually a good thing
          toast({
            title: "Account already exists",
            description: "An account with this email already exists. Please check your email or try signing in.",
          });
          navigate("/welcome", { state: { email } });
          setIsLoading(false);
          return;
        }
        
        setErrorMessage(error.message || "An error occurred during signup");
        setIsLoading(false);
        return;
      }
      
      // Show success message
      toast({
        title: "Account created",
        description: "Please check your email for verification instructions",
      });
      
      // Redirect to welcome page or show success state
      navigate("/welcome", { state: { email } });
      
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
