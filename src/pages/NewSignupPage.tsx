
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { registerNewUser, checkUserExists } from "@/services/newSignupService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AtSign, Lock, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { TimeoutDialog } from "@/components/auth/TimeoutDialog";

const NewSignupPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showTimeoutDialog, setShowTimeoutDialog] = useState(false);
  const [isCheckingExistingUser, setIsCheckingExistingUser] = useState(false);
  const navigate = useNavigate();

  // This effect checks if a user account was created despite timeout
  useEffect(() => {
    if (showTimeoutDialog && email && !isCheckingExistingUser) {
      setIsCheckingExistingUser(true);
      
      // Add a delay before checking to allow Supabase to complete the operation
      const timer = setTimeout(async () => {
        try {
          const exists = await checkUserExists(email);
          
          if (exists) {
            console.log("User account exists despite timeout error");
            toast({
              title: "Account may exist",
              description: "We detected that your account might have been created. Please check your email or try signing in.",
            });
          }
        } catch (err) {
          console.error("Error checking if user exists:", err);
        } finally {
          setIsCheckingExistingUser(false);
        }
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [showTimeoutDialog, email]);

  // Create a function to handle timeouts with retry logic
  const handleSignupWithRetry = async (retryCount = 0): Promise<any> => {
    if (retryCount >= 2) {
      // If we've already retried twice, show the timeout dialog
      setShowTimeoutDialog(true);
      setIsLoading(false);
      return { error: { code: 'max_retries', message: 'Maximum retry attempts reached' } };
    }
    
    console.log(`Signup attempt for: ${email} with redirect to: https://dirigovotes.com/welcome${retryCount > 0 ? ` (retry ${retryCount})` : ''}`);
    
    try {
      // Check if user already exists before attempting to create
      if (retryCount > 0) {
        const exists = await checkUserExists(email);
        if (exists) {
          console.log("User already exists, avoiding duplicate registration");
          return { 
            error: { 
              code: 'user_exists', 
              message: 'An account with this email already exists. Please check your email for verification instructions or try signing in.' 
            } 
          };
        }
      }
      
      const result = await registerNewUser(email, password, "https://dirigovotes.com/welcome");
      
      if (result.error) {
        console.log(`Signup error (attempt ${retryCount})`, result.error);
        
        // If it's a timeout error, retry automatically after a delay
        const isTimeout = 
          result.error.code === 'email_timeout' || 
          result.error.message?.includes('timeout') || 
          (result.error as any)?.status === 504 || 
          result.error.message?.includes('may have been created');
          
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
        
        // If it's a user_exists error, treat it as a success
        if (result.error.code === 'user_exists') {
          console.log("User already exists, treating as success");
          return { data: { user: { email } }, error: null };
        }
        
        return result;
      }
      
      return result;
    } catch (err) {
      console.error(`Unexpected error during signup (attempt ${retryCount}):`, err);
      return { error: err };
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
      const { data, error } = await handleSignupWithRetry();
      
      if (error) {
        console.log("Final signup error:", error.code, error.message);
        
        // Special handling for timeout errors
        if (error.code === 'email_timeout' || error.message?.includes("timeout") || error.message?.includes("may have been created")) {
          setShowTimeoutDialog(true);
          setIsLoading(false);
          return;
        }
        
        if (error.code === 'max_retries') {
          // Already handled above
          return;
        }
        
        if (error.code === 'user_exists') {
          // User already exists - this is actually a good thing
          toast({
            title: "Account already exists",
            description: "An account with this email already exists. Please check your email or try signing in.",
          });
          navigate("/welcome", { state: { email } });
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
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Create a new account</CardTitle>
          <CardDescription>
            Enter your email and password to sign up
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {errorMessage && (
              <div className="bg-destructive/15 text-destructive p-3 rounded-md flex items-start">
                <AlertCircle className="h-4 w-4 mt-0.5 mr-2 flex-shrink-0" />
                <p className="text-sm">{errorMessage}</p>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="new-email">Email</Label>
              <div className="relative">
                <AtSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="new-email"
                  type="email"
                  placeholder="youremail@example.com"
                  className="pl-9"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="new-password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="new-password"
                  type="password"
                  className="pl-9"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">Password must be at least 6 characters</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirm-password"
                  type="password"
                  className="pl-9"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              className="w-full" 
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Creating account..." : "Sign up"}
            </Button>
            
            <div className="text-center text-sm">
              Already have an account?{" "}
              <a href="/sign-in" className="text-primary hover:underline">
                Log in
              </a>
            </div>
          </CardFooter>
        </form>
      </Card>

      <TimeoutDialog 
        open={showTimeoutDialog} 
        onOpenChange={setShowTimeoutDialog}
        onRetry={handleRetry}
        email={email}
      />
    </div>
  );
};

export default NewSignupPage;
