
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
    
    // Reduce timeout to avoid race conditions with server timeouts
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('Email verification timed out. Your account may have been created, but the verification email could not be sent.'));
      }, 8000); // 8 seconds timeout to preempt server timeouts
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
    try {
      const response = await Promise.race([signupPromise, timeoutPromise]);
      
      // Log result for debugging
      if ('error' in response && response.error) {
        console.error("Registration error:", response.error);
        
        // Handle user already exists error
        if (response.error.message?.includes("already") || 
            response.error.message?.includes("exists") ||
            response.error.status === 400) {
          return {
            data: null,
            error: {
              code: 'user_exists',
              message: 'An account with this email already exists. Please try signing in or reset your password.'
            }
          };
        }
        
        // Return custom error for timeouts or network issues
        if (
          response.error.message?.includes("timeout") || 
          response.error.message?.includes("deadline exceeded") ||
          response.error.message?.includes("fetch") ||
          response.error.message?.includes("network") ||
          (response.error as any)?.status === 504
        ) {
          return {
            data: null,
            error: {
              code: 'email_timeout',
              message: 'Email verification timed out. Your account may have been created, but the verification email could not be sent.'
            }
          };
        }
        
        return response;
      } else {
        console.log("Registration successful, user ID:", response.data?.user?.id);
        return response;
      }
    } catch (raceError: any) {
      // This catches errors from the Promise.race
      console.error("Error during signup race:", raceError);
      
      if (raceError.message?.includes("timeout")) {
        return {
          data: null,
          error: {
            code: 'email_timeout',
            message: 'Email verification timed out. Your account may have been created, but the verification email could not be sent.'
          }
        };
      }
      
      return {
        data: null,
        error: {
          code: 'signup_error',
          message: raceError.message || 'An error occurred during signup'
        }
      };
    }
  } catch (err: any) {
    console.error("Unexpected error in registerNewUser:", err);
    
    // Check if this is a timeout or network related error
    if (
      err.message?.includes("timeout") || 
      err.message?.includes("Network") ||
      err.message?.includes("fetch") ||
      err.code === 'email_timeout' ||
      (err as any)?.status === 504
    ) {
      return {
        data: null,
        error: {
          name: "AuthRetryableFetchError",
          code: 'email_timeout',
          message: 'Email verification timed out. Your account may have been created, but the verification email could not be sent.'
        }
      };
    }
    
    return {
      data: null,
      error: {
        code: 'signup_error',
        message: err.message || 'An unexpected error occurred during signup'
      }
    };
  }
}

/**
 * Check if a user exists by email
 * This helps prevent duplicate accounts during timeouts
 * 
 * @param email The email to check
 * @returns True if user exists, false otherwise
 */
export async function checkUserExists(email: string): Promise<boolean> {
  try {
    // Try to sign in with an invalid password to check if user exists
    // We use a short timeout to prevent long waits
    const signInPromise = supabase.auth.signInWithPassword({
      email,
      password: 'check-user-exists-invalid-password',
    });
    
    const timeoutPromise = new Promise<{error: {message: string}}>((resolve) => {
      setTimeout(() => resolve({ error: { message: 'timeout' } }), 5000);
    });
    
    const result = await Promise.race([signInPromise, timeoutPromise]);
    
    // If we get an "Invalid login credentials" error, the user exists
    return Boolean(result.error && result.error.message.includes('Invalid login credentials'));
  } catch (err) {
    console.error("Error checking if user exists:", err);
    return false;
  }
}
