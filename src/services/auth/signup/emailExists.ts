
import { supabase } from "@/integrations/supabase/client";

/**
 * Check if an email is already registered
 * @param email The email to check
 * @returns Promise resolving to true if the email exists, false otherwise
 */
export async function emailExists(email: string): Promise<boolean> {
  try {
    if (!email) return false;
    
    console.log(`Checking if email exists: ${email}`);
    
    // Method 1: Try to use the signUp method with a temporary password
    // This approach leverages the built-in validation in Supabase
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password: `TemporaryCheck${Math.random().toString(36).substring(2)}!A1`, // Random password that meets requirements
      options: {
        emailRedirectTo: window.location.origin + '/welcome',
      }
    });
    
    // If the error message mentions the email is already registered, the email exists
    if (signUpError) {
      const errorMsg = signUpError.message.toLowerCase();
      if (errorMsg.includes("already") || errorMsg.includes("existing")) {
        console.log(`Email check result for ${email}: Exists (already registered)`);
        return true;
      }
    }
    
    console.log(`Email check result for ${email}: Does not exist`);
    return false;
    
  } catch (err) {
    console.error("Error checking if email exists:", err);
    // In case of error, assume the user doesn't exist for security reasons
    return false;
  }
}
