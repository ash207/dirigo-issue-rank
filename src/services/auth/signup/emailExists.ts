
import { supabase } from "@/integrations/supabase/client";

/**
 * Check if an email is already registered
 * @param email The email to check
 * @returns Promise resolving to true if the email exists, false otherwise
 */
export async function emailExists(email: string): Promise<boolean> {
  try {
    // Use a standard sign-in with an invalid password to check if the user exists
    // This will return a specific error if the user exists
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: 'check-user-exists-intentionally-wrong',
    });
    
    // If we get an invalid login credentials error, the user exists
    // This error occurs when the email exists but the password is wrong
    if (error && error.message) {
      console.log(`Email check for ${email}: ${error.message}`);
      
      // If we specifically get "Invalid login credentials", it means
      // the email exists but the password is wrong
      if (error.message.includes('Invalid login credentials')) {
        return true;
      }
      
      // For any other error messages (including "Email not confirmed", 
      // "Invalid email", etc.), assume the user doesn't exist
      return false;
    }
    
    // If no error (which shouldn't happen with an intentionally wrong password),
    // assume user doesn't exist for safety
    return false;
  } catch (err) {
    console.error("Error checking if email exists:", err);
    // In case of error, we assume the user doesn't exist for security reasons
    return false;
  }
}
