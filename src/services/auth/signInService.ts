
import { AuthError } from '@supabase/supabase-js';
import { supabase } from "@/integrations/supabase/client";
import { logError, ErrorType } from '../errorLoggingService';

export async function signIn(
  email: string, 
  password: string, 
  onSuccess: () => void, 
  onError: (error: AuthError) => void
) {
  try {
    const { error, data } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Log the error
      const errorType: ErrorType = error.message.includes('timeout') ? 'auth_timeout' : 'auth_error';
      await logError({
        error_type: errorType,
        error_message: error.message,
        component: 'SignIn',
        user_id: data?.user?.id
      });
      
      throw error;
    }
    
    onSuccess();
  } catch (error: any) {
    onError(error);
    throw error;
  }
}
