
import { supabase } from "@/integrations/supabase/client";

export async function signUp(
  email: string, 
  password: string, 
  redirectUrl: string,
  onSuccess: (userData: any) => void, 
  onError: (error: any) => void
) {
  try {
    console.log("Starting signup process for:", email);
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          email_confirmed: true, // Set this to true to skip email confirmation
        }
      }
    });
    
    if (error) {
      console.error("Supabase returned an error during signup:", error);
      throw error;
    }
    
    console.log("Signup successful! User data:", data);
    
    // Call the success callback
    onSuccess(data);
    
  } catch (error: any) {
    console.error("Final signup error:", error);
    
    // Provide helpful error messages based on error type
    let errorMessage = "Failed to create account";
    
    if (error.status === 504 || error.message?.includes("timeout") || error.message?.includes("gateway")) {
      errorMessage = "The server is experiencing high traffic. Your account may have been created. Please check your email or try signing in with the credentials you just used.";
      
      // Return a special error that indicates potential account creation
      onError({
        ...error,
        code: "potential_success_with_timeout",
        message: errorMessage
      });
      return;
    } else if (error.message?.includes("already") || error.message?.includes("exists")) {
      errorMessage = "An account with this email already exists. Please try signing in.";
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    console.log("Returning user-friendly error:", errorMessage);
    onError({ ...error, message: errorMessage });
  }
}
