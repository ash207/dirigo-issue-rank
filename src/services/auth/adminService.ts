
import { supabase } from "@/integrations/supabase/client";

/**
 * Check if an email exists in the system using the dedicated edge function
 * @param email The email to check
 * @param token JWT token for authentication
 * @returns Promise resolving to true if the email exists, false otherwise
 */
export async function checkEmailExistsAdmin(email: string, token: string): Promise<boolean> {
  try {
    if (!email || !token) return false;
    
    const { data, error } = await supabase.functions.invoke("check-email-exists", {
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: { email }
    });
    
    if (error) throw error;
    
    return data?.exists || false;
  } catch (err) {
    console.error("Error checking if email exists:", err);
    return false;
  }
}

/**
 * Look up detailed user information by email
 * @param email The email to look up
 * @param token JWT token for authentication
 * @returns Promise resolving to the user information if found
 */
export async function lookupUserByEmail(email: string, token: string) {
  try {
    if (!email || !token) {
      throw new Error("Email and authentication token are required");
    }
    
    const { data, error } = await supabase.functions.invoke("lookup-user", {
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: { email }
    });
    
    if (error) throw error;
    
    return data;
  } catch (err) {
    console.error("Error looking up user:", err);
    throw err;
  }
}
