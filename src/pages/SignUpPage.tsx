
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AtSign, Lock, AlertCircle, RefreshCw, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Define form validation schema
const signUpSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type SignUpFormValues = z.infer<typeof signUpSchema>;

const SignUpPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTimeoutDialog, setShowTimeoutDialog] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const { signUp, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Set up form with validation
  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (values: SignUpFormValues) => {
    setIsLoading(true);
    setError(null);
    setShowTimeoutDialog(false);
    
    try {
      // Increment retry count for tracking purposes
      const attemptCount = retryCount + 1;
      setRetryCount(attemptCount);
      
      console.log(`Signup attempt #${attemptCount} for ${values.email}`);
      await signUp(values.email, values.password);
      // Success message will be shown by the AuthContext
    } catch (error: any) {
      console.error(`Sign-up error (attempt #${retryCount}):`, error);
      
      // Handle specific error cases
      if (error.code === "over_email_send_rate_limit") {
        setError("Too many sign-up attempts. Please try again later.");
      } else if (error.status === 504 || error.code === "23505" || 
                error.message?.includes("timeout") || error.message?.includes("gateway") || 
                error.message?.includes("timed out")) {
        // More specific messaging for timeout issues
        setError("The server is currently busy. This doesn't mean your account wasn't created. Please check your email or try signing in with the credentials you just entered.");
        setShowTimeoutDialog(true);
      } else if (error.message?.includes("already") || error.message?.includes("exists")) {
        setError("An account with this email already exists. Please try signing in instead.");
      } else if (error.message) {
        setError(error.message);
      } else {
        setError("Failed to create account. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    if (form.getValues().email && form.getValues().password) {
      form.handleSubmit(onSubmit)();
    }
  };

  const closeTimeoutDialog = () => {
    setShowTimeoutDialog(false);
  };

  return (
    <Layout>
      <div className="container mx-auto max-w-lg py-10">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Create an account</CardTitle>
            <CardDescription>
              Enter your information to create an account
            </CardDescription>
          </CardHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-4">
                {error && (
                  <Alert variant="destructive" className="flex items-start">
                    <AlertCircle className="h-4 w-4 mt-0.5 mr-2 flex-shrink-0" />
                    <div className="flex-1">
                      <AlertDescription>{error}</AlertDescription>
                      {(error.includes("busy") || error.includes("timeout") || error.includes("gateway") || error.includes("timed out")) && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={handleRetry} 
                          className="mt-2 flex items-center"
                          type="button"
                        >
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Try again
                        </Button>
                      )}
                    </div>
                  </Alert>
                )}
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel>Email</FormLabel>
                      <div className="relative">
                        <AtSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <FormControl>
                          <Input
                            placeholder="youremail@example.com"
                            className="pl-9"
                            {...field}
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel>Password</FormLabel>
                      <div className="relative">
                        <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <FormControl>
                          <Input
                            type="password"
                            className="pl-9"
                            {...field}
                          />
                        </FormControl>
                      </div>
                      <p className="text-xs text-muted-foreground">Password must be at least 6 characters long</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              
              <CardFooter className="flex flex-col space-y-4">
                <Button 
                  className="w-full bg-dirigo-blue" 
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating account..." : "Sign up"}
                </Button>
                <div className="text-center text-sm">
                  Already have an account?{" "}
                  <Link to="/sign-in" className="text-dirigo-blue hover:underline">
                    Sign in
                  </Link>
                </div>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>

      {/* Timeout information dialog */}
      <Dialog open={showTimeoutDialog} onOpenChange={setShowTimeoutDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Server Timeout Information</DialogTitle>
            <DialogDescription>
              Due to high demand, the server is experiencing timeouts during account creation.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Alert>
              <Info className="h-4 w-4 mr-2" />
              <AlertDescription>
                <strong>Important:</strong> Even when you see a timeout, your account may have been successfully created. 
                Check your email for a verification link before trying again.
              </AlertDescription>
            </Alert>
            <p>What you can do now:</p>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Check your inbox (and spam folder) for a verification email</li>
              <li>Try to sign in with the credentials you just used</li>
              <li>Wait a few minutes before trying to sign up again</li>
            </ol>
          </div>
          <DialogFooter className="flex justify-between">
            <Button variant="outline" onClick={closeTimeoutDialog}>
              Close
            </Button>
            <div className="space-x-2">
              <Button variant="outline" onClick={handleRetry}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
              <Button onClick={() => {
                closeTimeoutDialog();
                navigate("/sign-in");
              }}>
                Go to Sign In
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default SignUpPage;
