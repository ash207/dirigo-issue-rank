
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
    // Server side likely has a 10s timeout, so we'll use 8s to detect it first
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject({
          error: {
            code: 'email_timeout',
            message: 'Email verification timed out. Your account may have been created, but the verification email could not be sent.'
          }
        });
      }, 8000); // 8 seconds timeout to preempt server timeouts
    });
    
    // Check if user already exists before attempting signup
    // Using the auth API to check for existing users by email
    const { data: existingUsers, error: userLookupError } = await supabase.auth.admin
      .listUsers({ filter: `email.eq.${email}` })
      .catch(() => ({ data: { users: [] }, error: null }));
    
    if (userLookupError) {
      console.error("Error checking for existing user:", userLookupError);
    }
    
    if (existingUsers?.users && existingUsers.users.length > 0) {
      return {
        data: null,
        error: {
          code: 'user_exists',
          message: 'An account with this email already exists. Please try signing in or reset your password.'
        }
      };
    }
    
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
      timeoutPromise
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
        (response.error as any)?.status === 504
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
      (err as any)?.status === 504
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
    
    const timeoutPromise = new Promise((_, resolve) => {
      setTimeout(() => resolve({ error: { message: 'timeout' } }), 5000);
    });
    
    const result = await Promise.race([signInPromise, timeoutPromise]) as any;
    
    // If we get an "Invalid login credentials" error, the user exists
    return result.error && result.error.message.includes('Invalid login credentials');
  } catch (err) {
    console.error("Error checking if user exists:", err);
    return false;
  }
}
