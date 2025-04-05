
import { supabase } from "@/integrations/supabase/client";

/**
 * Check if a user exists by email
 * This helps prevent duplicate accounts during timeouts
 * 
 * @param email The email to check
 * @returns True if user exists, false otherwise
 */
export async function checkUserExists(email: string): Promise<boolean> {
  try {
    // Try to sign in with an invalid password to check if user exists
    // We use a short timeout to prevent long waits
    const signInPromise = supabase.auth.signInWithPassword({
      email,
      password: 'check-user-exists-invalid-password',
    });
    
    const timeoutPromise = new Promise<{error: {message: string}}>((resolve) => {
      setTimeout(() => resolve({ error: { message: 'timeout' } }), 5000);
    });
    
    const result = await Promise.race([signInPromise, timeoutPromise]);
    
    // If we get an "Invalid login credentials" error, the user exists
    return Boolean(result.error && result.error.message.includes('Invalid login credentials'));
  } catch (err) {
    console.error("Error checking if user exists:", err);
    return false;
  }
}
