
import { supabase } from "@/integrations/supabase/client";

/**
 * Handles user signup with email and password
 */
export async function registerNewUser(email: string, password: string) {
  console.log("Starting new signup process for:", email);
  
  try {
    // Get the origin dynamically and ensure it matches what's set in Supabase
    const origin = window.location.origin;
    const redirectUrl = `${origin}/welcome`;
    
    console.log(`Using redirect URL: ${redirectUrl}`);
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
      }
    });
    
    if (error) {
      console.error("Signup error:", error);
      throw error;
    }
    
    console.log("New signup successful:", data);
    return { data, error: null };
    
  } catch (error: any) {
    console.error("Error in registerNewUser:", error);
    
    // Format error message for frontend
    let message = "Failed to create account";
    
    if (error.message?.includes("already") || error.message?.includes("exists")) {
      message = "An account with this email already exists";
    } else if (error.status === 504 || error.message?.includes("timeout")) {
      message = "Server timeout - your account may have been created. Please check your email";
    } else if (error.message) {
      message = error.message;
    }
    
    return { 
      data: null, 
      error: { message } 
    };
  }
}
