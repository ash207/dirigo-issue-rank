
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
    
    // Check if the user needs to confirm their email
    if (data?.user && !data.user.confirmed_at) {
      console.log("User created but needs email confirmation");
    }
    
    return { data, error: null };
    
  } catch (error: any) {
    console.error("Error in registerNewUser:", error);
    
    // Format error message for frontend
    let message = "Failed to create account";
    let code = error.code || "unknown_error";
    
    if (error.message?.includes("already") || error.message?.includes("exists")) {
      message = "An account with this email already exists";
      code = "email_exists";
    } else if (error.status === 504 || error.message?.includes("timeout") || 
               error.message?.includes("deadline exceeded") || error.message?.includes("gateway")) {
      message = "Server timeout - your account may have been created. Please check your email or try the resend verification option.";
      code = "email_timeout";
    } else if (error.message) {
      message = error.message;
    }
    
    return { 
      data: null, 
      error: { 
        message,
        code,
        originalError: error
      } 
    };
  }
}
