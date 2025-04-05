
import { supabase } from "@/integrations/supabase/client";
import { updateUserStatusIfVerified } from "@/utils/profileUtils";
import { AuthError } from '@supabase/supabase-js';

// Helper function to wait a specified time
export const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function signIn(
  email: string, 
  password: string, 
  onSuccess: () => void, 
  onError: (error: AuthError) => void
) {
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }
    
    onSuccess();
  } catch (error: any) {
    onError(error);
    throw error;
  }
}

// Improved sign-up function with better timeout handling
export async function signUp(
  email: string, 
  password: string, 
  redirectUrl: string,
  onSuccess: (userData: any) => void, 
  onError: (error: any) => void
) {
  try {
    // Set a timeout for the entire operation
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Request timed out after 10 seconds")), 10000);
    });
    
    // Create the actual signup promise with proper options
    const signUpPromise = supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
      }
    });
    
    // Race the signup against the timeout
    const { data, error } = await Promise.race([
      signUpPromise,
      timeoutPromise.then(() => {
        throw new Error("The server is busy. Please try again or check your email for a verification link.");
      })
    ]) as any;
    
    if (error) {
      throw error;
    }

    // Check if the user was actually created
    if (data?.user) {
      onSuccess(data);
    } else {
      throw new Error("Failed to create account. Please try again.");
    }
  } catch (error: any) {
    console.error("Signup error details:", error);
    
    // Handle specific error cases with improved messaging
    let errorMessage = "Failed to create account";
    
    if (error.code === "over_email_send_rate_limit") {
      errorMessage = "Too many sign-up attempts. Please try again later.";
    } else if (error.status === 504 || error.message?.includes("timeout") || 
              error.message?.includes("gateway") || error.message?.includes("timed out")) {
      errorMessage = "The server is busy. Your account may have been created. Please check your email or try signing in.";
    } else if (error.message?.includes("already") || error.message?.includes("exists")) {
      errorMessage = "An account with this email already exists. Please try signing in.";
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    onError({ ...error, message: errorMessage });
    throw error;
  }
}

export async function signOut(onSuccess: () => void, onError: (error: any) => void) {
  try {
    await supabase.auth.signOut();
    onSuccess();
  } catch (error: any) {
    onError(error);
  }
}

// Listen for auth state changes and update profile if needed
export function setupAuthListener(callback: (user: any, session: any) => void) {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(session?.user ?? null, session);
    
    // Check email verification for any auth state change that has a user
    if (session?.user) {
      updateUserStatusIfVerified(session.user);
    }
  });
}
