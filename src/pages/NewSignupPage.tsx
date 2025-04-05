
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerNewUser } from "@/services/newSignupService";
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
  const navigate = useNavigate();

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
      const result = await registerNewUser(email, password, "https://dirigovotes.com/welcome");
      
      if (result.error) {
        console.log(`Signup error (attempt ${retryCount})`, result.error);
        
        // If it's a timeout error, retry automatically
        // Fix: Check for timeout indicators without relying on the status property which might not exist
        if (
          result.error.code === 'email_timeout' || 
          result.error.message?.includes('timeout') || 
          (result.error as any).status === 504 || // Use type assertion for optional status check
          result.error.message?.includes('may have been created')
        ) {
          console.log(`Retrying signup automatically (attempt ${retryCount + 1})`);
          
          // Wait 2 seconds before retrying
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Retry with incremented count
          return handleSignupWithRetry(retryCount + 1);
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
