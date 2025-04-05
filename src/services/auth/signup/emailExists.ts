
import { supabase } from "@/integrations/supabase/client";

/**
 * Check if an email address is already registered
 * @param email The email address to check
 * @returns A promise resolving to true if the email exists, false otherwise
 */
export async function emailExists(email: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.functions.invoke("check-email-exists", {
      body: { email }
    });
    
    if (error) throw error;
    
    return data?.exists || false;
  } catch (err) {
    console.error("Error checking if email exists:", err);
    return false; // Fail closed - assume email doesn't exist on error
  }
}
