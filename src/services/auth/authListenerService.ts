
import { supabase } from "@/integrations/supabase/client";
import { updateUserStatusIfVerified } from "@/utils/profileUtils";

// Listen for auth state changes and update profile if needed
export function setupAuthListener(callback: (user: any, session: any) => void) {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(session?.user ?? null, session);
    
    // Check email verification for any auth state change that has a user
    if (session?.user) {
      updateUserStatusIfVerified(session.user);
    }
  });
}
