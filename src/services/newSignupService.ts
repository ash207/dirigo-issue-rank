
import { supabase } from "@/integrations/supabase/client";

/**
 * Register a new user with email and password
 * 
 * @param email The user's email address
 * @param password The user's password
 * @param redirectTo Optional URL to redirect to after email confirmation
 * @returns A promise that resolves to the auth response
 */
export async function registerNewUser(email: string, password: string, redirectTo = "https://dirigovotes.com/welcome") {
  try {
    console.log(`Registering new user with email: ${email} and redirect URL: ${redirectTo}`);
    
    const response = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectTo,
        data: {
          email_confirmed: false,
        }
      }
    });
    
    // Log result for debugging
    if (response.error) {
      console.error("Registration error:", response.error);
      
      // Return custom error for timeouts
      if (response.error.message?.includes("timeout") || response.error.message?.includes("deadline exceeded")) {
        return {
          data: response.data,
          error: {
            ...response.error,
            code: 'email_timeout',
            message: 'Email verification timed out. Your account may have been created, but the verification email could not be sent.'
          }
        };
      }
    } else {
      console.log("Registration successful, user ID:", response.data?.user?.id);
    }
    
    return response;
  } catch (err) {
    console.error("Unexpected error in registerNewUser:", err);
    throw err;
  }
}
