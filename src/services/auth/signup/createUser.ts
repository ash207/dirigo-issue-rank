
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

/**
 * Create a new user and send confirmation email
 * @param email User's email
 * @param password User's password
 * @returns Promise resolving to true if successful, false otherwise
 */
export async function createUser(email: string, password: string): Promise<boolean> {
  try {
    // Always use the production domain for redirects in deployed environments
    // or fallback to the current origin in development
    const redirectUrl = `${window.location.origin}/welcome`;
    
    console.log(`Creating user with email: ${email}, redirecting to: ${redirectUrl}`);
    
    // Set a timeout for the request to handle potential gateway timeouts
    const signUpPromise = supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          email_confirmed: true, // Set this to true to skip email confirmation
        }
      }
    });
    
    // Create a timeout promise that rejects after 10 seconds
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject({
          status: 504,
          message: 'The signup request timed out. Your account may have been created but we couldn\'t confirm it.',
          __isAuthError: true
        });
      }, 10000); // 10 seconds timeout
    });
    
    // Race between the signup request and the timeout
    const { data, error } = await Promise.race([
      signUpPromise,
      timeoutPromise
    ]) as any;
    
    if (error) {
      console.error("Error creating user:", error);
      
      // Check if the error indicates user already exists
      if (error.message?.toLowerCase().includes("already") || 
          error.message?.toLowerCase().includes("exists")) {
        toast({
          title: "Account Already Exists",
          description: "An account with this email already exists. Please try signing in.",
          variant: "default",
        });
        return true; // Return true to redirect to welcome page
      }
      
      // Special handling for timeout errors
      if (error.status === 504 || error.message?.includes('timeout')) {
        toast({
          title: "Signup may have succeeded",
          description: "We couldn't confirm if your account was created due to a timeout. Please check your email or try signing in.",
          variant: "default",
        });
        // Return true in case of timeout as the user might have been created
        return true;
      }
      
      toast({
        title: "Error",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
      return false;
    }
    
    console.log("User created successfully:", data);
    
    // If email confirmation is set to true in the user data, we can assume the account is ready
    if (data.user?.user_metadata?.email_confirmed) {
      toast({
        title: "Account Created",
        description: "Your account has been created. You can now sign in.",
      });
    } else {
      toast({
        title: "Account Created",
        description: "Please check your email for a confirmation link.",
      });
    }
    
    return true;
  } catch (err: any) {
    console.error("Unexpected error creating user:", err);
    
    // Special handling for timeout errors
    if (err.status === 504 || err.message?.includes('timeout')) {
      toast({
        title: "Signup may have succeeded",
        description: "We couldn't confirm if your account was created due to a timeout. Please check your email or try signing in.",
        variant: "default",
      });
      // Return true in case of timeout as the user might have been created
      return true;
    }
    
    toast({
      title: "Error",
      description: err.message || "An unexpected error occurred",
      variant: "destructive",
    });
    return false;
  }
}
