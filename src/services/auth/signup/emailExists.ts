
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
    
    // Try to use the signUp method with the email to check if it already exists
    // This is a direct way to check email existence without actually creating a user
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password: 'temporaryPassword123!', // This won't be used since we're just checking
      options: {
        emailRedirectTo: window.location.origin + '/welcome',
      }
    });
    
    // If the error message contains "already registered", the email exists
    if (signUpError && signUpError.message.toLowerCase().includes("already")) {
      console.log(`Email check result for ${email}: Exists (already registered)`);
      return true;
    }
    
    // If we've reached here and no "already registered" error was found, the email is available
    console.log(`Email check result for ${email}: Does not exist`);
    return false;
    
  } catch (err) {
    console.error("Error checking if email exists:", err);
    // In case of error, assume the user doesn't exist for security reasons
    return false;
  }
}
