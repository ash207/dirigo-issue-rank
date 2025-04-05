
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
    
    // We'll add a reasonably long timeout to the request
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('Request timed out after 15 seconds'));
      }, 15000);
    });
    
    // Create the actual signup request
    const signupPromise = supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectTo,
        data: {
          email_confirmed: false,
        }
      }
    });
    
    // Race the two promises
    const response = await Promise.race([
      signupPromise,
      timeoutPromise.then(() => {
        throw {
          error: {
            code: 'email_timeout',
            message: 'Email verification timed out. Your account may have been created, but the verification email could not be sent.'
          }
        };
      })
    ]) as Awaited<ReturnType<typeof supabase.auth.signUp>>;
    
    // Log result for debugging
    if (response.error) {
      console.error("Registration error:", response.error);
      
      // Return custom error for timeouts or network issues
      if (
        response.error.message?.includes("timeout") || 
        response.error.message?.includes("deadline exceeded") ||
        response.error.message?.includes("fetch") ||
        response.error.message?.includes("network") ||
        response.error.status === 504
      ) {
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
  } catch (err: any) {
    console.error("Unexpected error in registerNewUser:", err);
    
    // Check if this is a timeout or network related error
    if (
      err.message?.includes("timeout") || 
      err.message?.includes("Network") ||
      err.message?.includes("fetch") ||
      err.code === 'email_timeout' ||
      err.status === 504
    ) {
      return {
        data: { user: null, session: null },
        error: {
          name: "AuthRetryableFetchError",
          code: 'email_timeout',
          message: 'Email verification timed out. Your account may have been created, but the verification email could not be sent.'
        }
      };
    }
    
    throw err;
  }
}
