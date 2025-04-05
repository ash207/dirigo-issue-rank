
import { supabase } from "@/integrations/supabase/client";
import { User } from '@supabase/supabase-js';

// Update user profile status when email is confirmed
export async function updateUserStatusIfVerified(currentUser: User | null) {
  if (!currentUser) return;
  
  // Check if email is confirmed
  if (currentUser.email_confirmed_at) {
    try {
      // Check current status
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('status')
        .eq('id', currentUser.id)
        .single();
        
      if (fetchError) throw fetchError;
      
      // If status is still pending but email is confirmed, update to active
      if (profile?.status === 'pending') {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ status: 'active' })
          .eq('id', currentUser.id);
          
        if (updateError) throw updateError;
        
        console.log('User status updated to active after email verification');
      }
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  }
}
