
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
          email_confirmed: false,
        }
      }
    });
    
    // Create a timeout promise that rejects after 15 seconds
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('The signup request timed out. Your account may have been created but we couldn\'t confirm it.'));
      }, 15000); // 15 seconds timeout
    });
    
    // Race between the signup request and the timeout
    const { data, error } = await Promise.race([
      signUpPromise,
      timeoutPromise.then(() => {
        throw {
          status: 504,
          message: 'Gateway timeout while creating account',
          __isAuthError: true
        };
      })
    ]) as any;
    
    if (error) {
      console.error("Error creating user:", error);
      
      // Special handling for timeout errors
      if (error.status === 504 || error.message?.includes('timeout')) {
        toast({
          title: "Signup may have succeeded",
          description: "We couldn't confirm if your account was created due to a timeout. Please try signing in or check your email.",
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
    toast({
      title: "Account Created",
      description: "Please check your email for a confirmation link.",
    });
    
    return true;
  } catch (err: any) {
    console.error("Unexpected error creating user:", err);
    
    // Special handling for timeout errors
    if (err.status === 504 || err.message?.includes('timeout')) {
      toast({
        title: "Signup may have succeeded",
        description: "We couldn't confirm if your account was created due to a timeout. Please try signing in or check your email.",
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
