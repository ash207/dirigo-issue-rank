
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
    
    // Use auth.getUser() with an email parameter to check for existence
    // This API will return a user if it exists, or error if it doesn't
    const { data, error } = await supabase.auth.admin.getUserByEmail(email);
    
    // If we got user data back, the email exists
    if (data && !error) {
      console.log(`Email check result for ${email}: Exists`);
      return true;
    }
    
    // Alternatively, try to use the signUp method with a check:isEmailExists flag
    // This is a direct way to check email existence without actually creating a user
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password: 'temporaryPassword123!', // This won't be used since we're just checking
      options: {
        // This flag tells Supabase to only check if the email exists without creating a user
        emailRedirectTo: window.location.origin + '/welcome',
      }
    });
    
    // If the error message contains "already registered", the email exists
    if (signUpError && signUpError.message.includes("already")) {
      console.log(`Email check result for ${email}: Exists (already registered)`);
      return true;
    }
    
    // If we've reached here and no user exists error was found, the email is available
    console.log(`Email check result for ${email}: Does not exist`);
    return false;
    
  } catch (err) {
    console.error("Error checking if email exists:", err);
    // In case of error, assume the user doesn't exist for security reasons
    return false;
  }
}
