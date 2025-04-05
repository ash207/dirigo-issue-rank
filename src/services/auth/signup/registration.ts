
import { supabase } from "@/integrations/supabase/client";
import { processAuthResponse, processAuthError } from "./errorHandling";
import { AuthResponse } from "@/types/auth";

/**
 * Register a new user with email and password
 * 
 * @param email The user's email address
 * @param password The user's password
 * @param redirectTo Optional URL to redirect to after email confirmation
 * @returns A promise that resolves to the auth response
 */
export async function registerNewUser(email: string, password: string, redirectTo = "https://dirigovotes.com/welcome"): Promise<AuthResponse> {
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
      const response = await Promise.race([signupPromise, timeoutPromise]) as { 
        data: { user: any } | null; 
        error: { message?: string; status?: number; } | null;
      };
      
      return processAuthResponse(response);
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
    return processAuthError(err);
  }
}
