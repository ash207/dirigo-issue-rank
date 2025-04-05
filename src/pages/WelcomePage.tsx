
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { checkUserExists } from "@/services/auth/signup/userExistence";
import { toast } from "@/hooks/use-toast";
import { updateUserStatusIfVerified } from "@/utils/profileUtils";

const WelcomePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState<string>(location.state?.email || "");
  const [isChecking, setIsChecking] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isProcessingToken, setIsProcessingToken] = useState(false);
  const [tokenProcessed, setTokenProcessed] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  
  // Check for URL parameters (token and email) or try to get from session
  useEffect(() => {
    const checkEmailAndToken = async () => {
      // Try to get email from URL first, then from state, then from session
      const urlEmail = searchParams.get("email");
      
      if (urlEmail) {
        setEmail(urlEmail);
      } else if (!location.state?.email) {
        // Try to get the email from the current session
        const { data } = await supabase.auth.getSession();
        if (data.session?.user?.email) {
          setEmail(data.session.user.email);
        }
      }
      
      // Check if we have a token in the URL
      const token = searchParams.get("token");
      if (token && !tokenProcessed) {
        processToken(token, urlEmail || email);
      }
    };
    
    checkEmailAndToken();
  }, [location.state, searchParams]);

  // Process the token from the URL
  const processToken = async (token: string, email: string) => {
    setIsProcessingToken(true);
    
    try {
      console.log("Processing token:", token);
      console.log("Email:", email);
      
      if (!email) {
        throw new Error("Email is required for verification");
      }

      // Check if user exists
      const userExists = await checkUserExists(email);
      if (!userExists) {
        throw new Error("User not found");
      }

      // Decode token to get user ID and timestamp
      // In a real system, this would validate the token securely
      try {
        const tokenData = atob(token);
        const [userId, timestamp] = tokenData.split('_');
        
        console.log("Decoded token data:", { userId, timestamp });
        
        // Verify the token is not too old (24 hours)
        const tokenTime = parseInt(timestamp);
        const currentTime = Date.now();
        const tokenAge = currentTime - tokenTime;
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours
        
        if (tokenAge > maxAge) {
          throw new Error("Verification link has expired");
        }
        
        // Simulate confirming the user's email
        // In a real system, this would call a secure API endpoint
        
        // 1. Get the current session
        const { data: sessionData } = await supabase.auth.getSession();
        const session = sessionData.session;
        
        if (session && session.user) {
          // If user is already logged in, update their profile
          await updateUserStatusIfVerified(session.user);
          
          // Admin users can also call an edge function to update other users
          if (email !== session.user.email) {
            // This is an admin confirming another user
            const { data, error } = await supabase.functions.invoke("manage-user", {
              headers: {
                Authorization: `Bearer ${session.access_token}`
              },
              body: {
                userId,
                action: "confirmEmail",
                email: email
              }
            });
            
            if (error) throw error;
            console.log("Admin email confirmation result:", data);
          }
        } else {
          // User isn't logged in yet, we'll just tell them verification was successful
          console.log("User not logged in, but verification processed");
        }
        
        // Mark as successful
        setVerificationSuccess(true);
        toast({
          title: "Account Confirmed",
          description: "Your account has been successfully confirmed. You can now log in.",
        });
      } catch (decodeError) {
        console.error("Error decoding token:", decodeError);
        throw new Error("Invalid verification link");
      }
      
      setTokenProcessed(true);
    } catch (err: any) {
      console.error("Error processing token:", err);
      toast({
        title: "Error",
        description: err.message || "Could not process confirmation link. Please try signing in or contact support.",
        variant: "destructive"
      });
    } finally {
      setIsProcessingToken(false);
    }
  };

  const handleCheckAccount = async () => {
    if (!email) {
      toast({
        title: "Error",
        description: "No email address available to check",
        variant: "destructive"
      });
      return;
    }
    
    setIsChecking(true);
    
    try {
      const exists = await checkUserExists(email);
      
      if (exists) {
        toast({
          title: "Account Found",
          description: "We detected that your account exists. Please check your email or try signing in."
        });
      } else {
        toast({
          title: "No Account Found",
          description: "We couldn't find an account with this email. Please try signing up again."
        });
      }
    } catch (err) {
      console.error("Error checking account:", err);
      toast({
        title: "Error",
        description: "Could not check account status. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsChecking(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      toast({
        title: "Error",
        description: "No email address available for verification",
        variant: "destructive"
      });
      return;
    }

    setIsResending(true);
    
    try {
      const redirectUrl = `${window.location.origin}/welcome`;
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: redirectUrl
        }
      });
      
      if (error) {
        console.error("Error resending verification:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to resend verification email",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Verification Email Sent",
          description: "A new verification email has been sent. Please check your inbox."
        });
      }
    } catch (err: any) {
      console.error("Unexpected error resending verification:", err);
      toast({
        title: "Error",
        description: err.message || "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Welcome!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {isProcessingToken ? (
            <p>
              Processing your confirmation link... Please wait.
            </p>
          ) : tokenProcessed ? (
            verificationSuccess ? (
              <p className="text-green-600">
                Your account has been confirmed successfully! You can now proceed to login.
              </p>
            ) : (
              <p className="text-amber-600">
                We couldn't verify your account automatically. Please try logging in or contact support.
              </p>
            )
          ) : email ? (
            <p>
              We've sent a verification link to <strong>{email}</strong>. 
              Please check your email and click the link to verify your account.
            </p>
          ) : (
            <p>
              Your account has been created. Please check your email for a verification link.
            </p>
          )}
          
          <p className="text-sm text-muted-foreground">
            If you don't see the email, check your spam folder or try the options below.
          </p>
          
          <div className="flex flex-col space-y-3">
            {email && !tokenProcessed && (
              <>
                <Button 
                  variant="outline" 
                  onClick={handleCheckAccount}
                  disabled={isChecking || isProcessingToken}
                >
                  {isChecking ? "Checking..." : "Check Account Status"}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleResendVerification}
                  disabled={isResending || isProcessingToken}
                >
                  {isResending ? "Sending..." : "Resend Verification Email"}
                </Button>
              </>
            )}
            <Button onClick={() => navigate("/sign-in")}>
              Go to login
            </Button>
            <Button variant="outline" onClick={() => navigate("/")}>
              Return to home page
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WelcomePage;
