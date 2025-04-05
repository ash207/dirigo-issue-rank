
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
    
    // Create the signup request with a longer timeout
    const response = await Promise.race([
      supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectTo,
          data: {
            email_confirmed: true, // Set this to true to skip email confirmation
          }
        }
      }),
      // Create a timeout promise that will reject after 10 seconds
      new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error('Email verification timed out. Your account may have been created, but the verification email could not be sent.'));
        }, 10000); // 10 seconds timeout
      })
    ]);
    
    return processAuthResponse(response as any);
  } catch (err: any) {
    return processAuthError(err);
  }
}
