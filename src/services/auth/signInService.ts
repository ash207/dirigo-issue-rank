
import { AuthError } from '@supabase/supabase-js';
import { supabase } from "@/integrations/supabase/client";

export async function signIn(
  email: string, 
  password: string, 
  onSuccess: () => void, 
  onError: (error: AuthError) => void
) {
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }
    
    onSuccess();
  } catch (error: any) {
    onError(error);
    throw error;
  }
}
