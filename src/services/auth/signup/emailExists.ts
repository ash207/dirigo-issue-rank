
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
    
    // Use admin functions to check if the user exists
    // This just checks for existence without any authentication attempts
    const { count, error } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('id', email);
    
    if (error) {
      console.error("Error querying profiles:", error);
      return false;
    }
    
    const exists = count !== null && count > 0;
    console.log(`Email check result for ${email}: ${exists ? 'Exists' : 'Does not exist'}`);
    return exists;
    
  } catch (err) {
    console.error("Error checking if email exists:", err);
    // In case of error, assume the user doesn't exist for security reasons
    return false;
  }
}
