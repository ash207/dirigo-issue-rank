
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
    
    // Method: Try to sign in with an invalid password to check if the email exists
    // This will return an auth error with a specific message if the email exists
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: 'checkingEmailExistence', // This is intentionally incorrect
    });
    
    // If we get "Invalid login credentials", the email exists but password is wrong
    // If we get "Email not confirmed", the account exists but isn't verified
    if (error) {
      const errorMsg = error.message.toLowerCase();
      console.log(`Auth error response: ${errorMsg}`);
      
      if (
        errorMsg.includes("invalid login credentials") || 
        errorMsg.includes("email not confirmed") ||
        errorMsg.includes("invalid credentials")
      ) {
        console.log(`Email check result for ${email}: Exists (based on auth error)`);
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
