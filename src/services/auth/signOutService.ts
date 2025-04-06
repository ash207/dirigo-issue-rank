
import { supabase } from "@/integrations/supabase/client";
import { logError, ErrorType } from '../errorLoggingService';

export async function signOut(onSuccess: () => void, onError: (error: any) => void) {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      // Log the error
      const errorType: ErrorType = 'auth_error';
      await logError({
        error_type: errorType,
        error_message: error.message,
        component: 'SignOut'
      });
      
      throw error;
    }
    
    onSuccess();
  } catch (error: any) {
    // Log any other errors
    await logError({
      error_type: 'unknown',
      error_message: error.message || "Unknown error during sign out",
      component: 'SignOut'
    });
    
    onError(error);
  }
}
