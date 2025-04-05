
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
    
    // We'll use the signIn method to check if the email exists
    // This is the most reliable way to check without side effects
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: "ThisIsNotTheRealPassword123!",  // Intentionally wrong password
    });
    
    // Log the response for debugging
    console.log(`Sign-in check response for ${email}:`, error?.message);
    
    // If we get an "Invalid login credentials" error, the email exists
    // but the password is wrong (which is what we want)
    if (error) {
      const errorMessage = error.message?.toLowerCase() || '';
      
      // "Invalid login credentials" means email exists but password is wrong
      if (errorMessage.includes('invalid login credentials')) {
        console.log(`Email check result for ${email}: Exists`);
        return true;
      }
      
      // Any other error likely means the email doesn't exist
      console.log(`Email check result for ${email}: Does not exist (other error)`);
      return false;
    }
    
    // If there's no error, the sign-in worked (shouldn't happen with our fake password)
    // but if it did, it means the email exists
    console.log(`Email check result for ${email}: Exists (sign-in succeeded)`);
    return true;
    
  } catch (err) {
    console.error("Error checking if email exists:", err);
    // In case of error, assume the user doesn't exist for security reasons
    return false;
  }
}
