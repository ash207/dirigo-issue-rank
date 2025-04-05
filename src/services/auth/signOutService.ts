
import { supabase } from "@/integrations/supabase/client";

export async function signOut(onSuccess: () => void, onError: (error: any) => void) {
  try {
    await supabase.auth.signOut();
    onSuccess();
  } catch (error: any) {
    onError(error);
  }
}
