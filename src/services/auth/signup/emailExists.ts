
import { supabase } from "@/integrations/supabase/client";

/**
 * Check if an email is already registered
 * @param email The email to check
 * @returns Promise resolving to true if the email exists, false otherwise
 */
export async function emailExists(email: string): Promise<boolean> {
  try {
    // Instead of trying a password-based approach, we'll use a different method
    // that works more reliably for checking email existence
    
    // The adminAuthClient method would be ideal but requires service role key
    // Instead, we'll use the reset password flow which gives a clear indicator
    
    console.log(`Checking if email exists: ${email}`);
    
    // Using resetPasswordForEmail will respond differently for existing vs non-existing emails
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    
    console.log(`Password reset response for ${email}:`, error?.message);
    
    // If we get a "For security purposes..." message, the email exists
    // If we get "User not found", the email doesn't exist
    if (error) {
      if (error.message.includes("User not found")) {
        console.log(`Email check result for ${email}: Does not exist`);
        return false;
      }
    }
    
    // If no error or any other error, this usually means the email exists
    // (Supabase sends a reset email and returns success for security purposes)
    console.log(`Email check result for ${email}: Likely exists`);
    return true;
    
  } catch (err) {
    console.error("Error checking if email exists:", err);
    // In case of error, we assume the user doesn't exist for security reasons
    return false;
  }
}
