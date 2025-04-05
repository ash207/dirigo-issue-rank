
import { supabase } from "@/integrations/supabase/client";

/**
 * Check if a user exists by email
 * Uses sign in with incorrect password to detect existing accounts
 * 
 * @param email The email to check
 * @returns True if user exists, false otherwise
 */
export async function checkUserExists(email: string): Promise<boolean> {
  try {
    // Try to sign in with an invalid password to check if user exists
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: 'check-user-exists-invalid-password',
    });
    
    // If we get an "Invalid login credentials" error, the user exists
    // If we get an "Email not confirmed" error, the user exists but isn't verified
    return Boolean(
      error && (
        error.message.includes('Invalid login credentials') || 
        error.message.includes('Email not confirmed') ||
        error.message.includes('invalid credentials')
      )
    );
  } catch (err) {
    console.error("Error checking if user exists:", err);
    return false;
  }
}
