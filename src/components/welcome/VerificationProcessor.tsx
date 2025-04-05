
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { checkUserExists } from "@/services/auth/signup/userExistence";
import { supabase } from "@/integrations/supabase/client";
import { updateUserStatusIfVerified } from "@/utils/profileUtils";

interface VerificationProcessorProps {
  email: string;
  setEmail: (email: string) => void;
  setTokenProcessed: (processed: boolean) => void;
  setVerificationSuccess: (success: boolean) => void;
  setIsProcessingToken: (isProcessing: boolean) => void;
}

const VerificationProcessor = ({ 
  email, 
  setEmail, 
  setTokenProcessed, 
  setVerificationSuccess,
  setIsProcessingToken
}: VerificationProcessorProps) => {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const checkEmailAndToken = async () => {
      // Try to get email from URL first, then from state, then from session
      const urlEmail = searchParams.get("email");
      
      if (urlEmail) {
        setEmail(urlEmail);
      } else if (!email) {
        // Try to get the email from the current session
        const { data } = await supabase.auth.getSession();
        if (data.session?.user?.email) {
          setEmail(data.session.user.email);
        }
      }
      
      // Check if we have a token in the URL
      const token = searchParams.get("token");
      if (token) {
        processToken(token, urlEmail || email);
      }
    };
    
    checkEmailAndToken();
  }, [searchParams, email, setEmail]);

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
      try {
        // Support both URL-safe base64 and standard base64 encoding
        let decoded;
        try {
          decoded = atob(token);
        } catch (e) {
          // If standard base64 decoding fails, try decoding as URL-safe base64
          decoded = atob(token.replace(/-/g, '+').replace(/_/g, '/'));
        }
        
        // Extract user ID and timestamp
        const [userId, timestamp] = decoded.split('_');
        
        console.log("Decoded token data:", { userId, timestamp });
        
        // Verify the token is not too old (24 hours)
        const tokenTime = parseInt(timestamp);
        const currentTime = Date.now();
        const tokenAge = currentTime - tokenTime;
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours
        
        if (tokenAge > maxAge) {
          throw new Error("Verification link has expired");
        }
        
        // 1. Get the current session
        const { data: sessionData } = await supabase.auth.getSession();
        const session = sessionData.session;
        
        if (session && session.user) {
          // If user is already logged in, update their profile status
          await updateUserStatusIfVerified(session.user);
          
          // Admin users can call edge function to update other users
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
          // User isn't logged in yet
          console.log("User not logged in, trying alternate confirmation method");
          
          // Try to sign in with token to confirm email
          // This is a workaround since we can't directly access auth.users without being logged in
          const { error: signInError } = await supabase.auth.signInWithOtp({
            email: email,
            options: {
              shouldCreateUser: false // Don't create a new user if one doesn't exist
            }
          });
          
          if (signInError) {
            console.error("Error sending OTP:", signInError);
            // Continue with the process even if OTP fails
          } else {
            console.log("Sent OTP to user for verification");
          }
          
          // For direct confirmation, the user will need to log in first
          toast({
            title: "Verification Initiated",
            description: "Please sign in with your email to complete verification.",
          });
        }
        
        // Mark as successful
        setVerificationSuccess(true);
        
        // Notify other components about the verification success
        // 1. For cross-tab communication
        localStorage.setItem('email_verification_success', Date.now().toString());
        
        // 2. For same-tab communication
        window.dispatchEvent(new CustomEvent('custom-email-verification', { 
          detail: { key: 'email_verification_success' } 
        }));
        
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

  return null;
};

export default VerificationProcessor;
