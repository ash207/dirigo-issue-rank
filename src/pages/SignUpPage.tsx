
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AtSign, Lock, AlertCircle, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const SignUpPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const { signUp, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      await signUp(email, password);
      // Success message will be shown by the AuthContext
    } catch (error: any) {
      console.error("Sign-up error:", error);
      
      // Handle specific error cases
      if (error.code === "over_email_send_rate_limit") {
        setError("Too many sign-up attempts. Please try again later.");
      } else if (error.status === 504 || error.message?.includes("timeout")) {
        if (retryCount < 2) {
          setError("The server is busy. We'll automatically retry in a few seconds...");
          setRetryCount(prev => prev + 1);
          
          // Automatically retry after a delay
          setTimeout(() => {
            handleSubmit(e);
          }, 3000);
        } else {
          setError("The server is experiencing high load. Please try again later or contact support if this persists.");
        }
      } else if (error.message) {
        setError(error.message);
      } else {
        setError("Failed to create account. Please try again.");
      }
    } finally {
      // Only set loading to false if not retrying
      if (!(error && (error as any).status === 504 && retryCount < 2)) {
        setIsLoading(false);
      }
    }
  };

  const handleRetry = (e: React.MouseEvent) => {
    e.preventDefault();
    setRetryCount(0);
    handleSubmit(new Event('submit') as any);
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
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="flex justify-between items-center">
                    <span>{error}</span>
                    {error.includes("server is busy") && 
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleRetry}
                        className="ml-2 flex items-center gap-1"
                      >
                        <RefreshCw className="h-3 w-3" /> Retry now
                      </Button>
                    }
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <AtSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
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
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    className="pl-9"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                <p className="text-xs text-muted-foreground">Password must be at least 6 characters long</p>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button 
                className="w-full bg-dirigo-blue" 
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (retryCount > 0 ? "Retrying..." : "Creating account...") : "Sign up"}
              </Button>
              <div className="text-center text-sm">
                Already have an account?{" "}
                <Link to="/sign-in" className="text-dirigo-blue hover:underline">
                  Sign in
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </Layout>
  );
};

export default SignUpPage;
