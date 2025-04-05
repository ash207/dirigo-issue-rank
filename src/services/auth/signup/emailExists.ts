
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
    
    // Use signUp with a dummy password to check if the email exists
    // This is more reliable than the reset password flow
    const { error } = await supabase.auth.signUp({
      email,
      password: "TemporaryPassword123!@#", // This won't be used if the email exists
    });
    
    console.log(`Sign-up check response for ${email}:`, error?.message);
    
    // If we get a message containing "already registered", the email exists
    if (error) {
      const errorMessage = error.message?.toLowerCase() || '';
      
      if (errorMessage.includes('already') || 
          errorMessage.includes('registered') || 
          errorMessage.includes('exists')) {
        console.log(`Email check result for ${email}: Exists`);
        return true;
      }
    }
    
    // If we get success response or any other error, the email likely doesn't exist
    console.log(`Email check result for ${email}: Does not exist`);
    return false;
    
  } catch (err) {
    console.error("Error checking if email exists:", err);
    // In case of error, assume the user doesn't exist for security reasons
    return false;
  }
}
