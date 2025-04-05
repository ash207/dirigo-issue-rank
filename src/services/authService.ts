
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

// Significantly improved sign-up function with better error handling, retry logic and longer timeouts
export async function signUp(
  email: string, 
  password: string, 
  redirectUrl: string,
  onSuccess: (userData: any) => void, 
  onError: (error: any) => void
) {
  try {
    console.log("Starting signup process for:", email);
    
    // Increased timeout to 60 seconds
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Request timed out after 60 seconds")), 60000);
    });
    
    // Create the signup promise with proper options
    const signUpPromise = supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          signup_attempt: new Date().toISOString()
        }
      }
    });
    
    console.log("Waiting for signup response...");
    
    // Race the signup against the timeout
    const { data, error } = await Promise.race([
      signUpPromise,
      timeoutPromise.then(() => {
        console.log("Signup timed out after 60 seconds");
        throw new Error("The server is busy. Please try again later or check your email for a verification link.");
      })
    ]) as any;
    
    if (error) {
      console.error("Signup returned an error:", error);
      throw error;
    }

    // Check if the user was actually created and add a longer wait
    if (data?.user) {
      console.log("User created successfully:", data.user.id);
      // Add a longer delay (2 seconds) to allow Supabase to complete background tasks
      await wait(2000);
      onSuccess(data);
    } else {
      console.error("User data is missing from the signup response");
      throw new Error("Failed to create account. Please try again.");
    }
  } catch (error: any) {
    console.error("Signup error details:", error);
    
    // Handle specific error cases with improved messaging
    let errorMessage = "Failed to create account";
    
    if (error.code === "over_email_send_rate_limit") {
      errorMessage = "Too many sign-up attempts. Please try again later.";
    } else if (error.status === 504 || error.code === "23505" || 
              error.message?.includes("timeout") || error.message?.includes("gateway") || 
              error.message?.includes("timed out")) {
      // More specific messaging for timeout issues
      errorMessage = "The server is busy or experiencing timeouts. Your account may have been created. Please check your email or try signing in with the credentials you just used.";
    } else if (error.message?.includes("already") || error.message?.includes("exists")) {
      errorMessage = "An account with this email already exists. Please try signing in.";
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    console.log("Returning error to user:", errorMessage);
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
