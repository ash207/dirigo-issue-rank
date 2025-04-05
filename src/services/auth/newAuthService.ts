
import { supabase } from "@/integrations/supabase/client";
import { AuthResponse } from "@supabase/supabase-js";
import { toast } from "sonner";

/**
 * Sign in with email and password
 */
export async function signInWithEmail(email: string, password: string): Promise<AuthResponse> {
  try {
    console.log("Signing in with email:", email);
    const response = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (response.error) {
      throw response.error;
    }
    
    console.log("Sign in successful");
    return response;
  } catch (error: any) {
    console.error("Error signing in:", error);
    toast.error("Failed to sign in", {
      description: error.message || "Please check your credentials and try again"
    });
    throw error;
  }
}

/**
 * Sign up with email and password
 */
export async function signUpWithEmail(
  email: string, 
  password: string, 
  redirectUrl = `${window.location.origin}/welcome`
): Promise<AuthResponse> {
  try {
    console.log(`Signing up with email: ${email}, redirecting to: ${redirectUrl}`);
    
    const response = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          email_confirmed: true, // Set this to true to skip email confirmation
        }
      }
    });
    
    if (response.error) {
      throw response.error;
    }
    
    console.log("Sign up successful, user data:", response.data.user);
    toast.success("Account created", {
      description: "Please check your email for verification instructions"
    });
    
    return response;
  } catch (error: any) {
    console.error("Error signing up:", error);
    
    // Handle known error cases
    if (error.message?.includes("already") || error.message?.includes("exists")) {
      toast.error("Account already exists", {
        description: "Please try signing in instead"
      });
    } else {
      toast.error("Failed to create account", {
        description: error.message || "Please try again later"
      });
    }
    
    throw error;
  }
}

/**
 * Sign out the current user
 */
export async function signOutUser(): Promise<void> {
  try {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
  } catch (error: any) {
    console.error("Error signing out:", error);
    toast.error("Failed to sign out", {
      description: error.message || "Please try again"
    });
    throw error;
  }
}

/**
 * Send a password reset email
 */
export async function sendPasswordResetEmail(email: string): Promise<void> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    
    if (error) {
      throw error;
    }
    
    toast.success("Password reset email sent", {
      description: "Please check your email for instructions"
    });
  } catch (error: any) {
    console.error("Error sending password reset email:", error);
    toast.error("Failed to send password reset email", {
      description: error.message || "Please try again later"
    });
    throw error;
  }
}
