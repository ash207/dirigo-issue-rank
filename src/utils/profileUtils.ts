
import { supabase } from "@/integrations/supabase/client";
import { User } from '@supabase/supabase-js';
import { toast } from "sonner";

// Update user profile status when email is confirmed
export async function updateUserStatusIfVerified(currentUser: User | null) {
  if (!currentUser) return;
  
  // Check if email is confirmed
  if (currentUser.email_confirmed_at) {
    try {
      console.log("Email is confirmed, updating profile status if needed");
      
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
        
        // Notify components that user status has changed
        notifyEmailVerification();
      }
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  }
}

// Helper function to notify components about email verification
export function notifyEmailVerification() {
  // Notify other browser tabs
  localStorage.setItem('email_verification_success', Date.now().toString());
  
  // Create a custom event to notify the current tab
  window.dispatchEvent(new CustomEvent('custom-email-verification', {
    detail: {
      key: 'email_verification_success',
      time: Date.now()
    }
  }));
}

// Manually update a user's profile status and email confirmation
export async function manuallyConfirmUserEmail(userId: string, session: any) {
  if (!userId || !session) return { success: false, message: "Missing required parameters" };
  
  try {
    console.log("Manually confirming email for user:", userId);
    
    // Make an admin call to the manage-user edge function
    const { data, error } = await supabase.functions.invoke("manage-user", {
      headers: {
        Authorization: `Bearer ${session.access_token}`
      },
      body: {
        userId,
        action: "confirmEmail"
      }
    });
    
    if (error) {
      console.error("Error from manage-user function:", error);
      throw error;
    }
    
    console.log("Email confirmation result:", data);

    // Notify other components about the verification success
    notifyEmailVerification();
    
    return { 
      success: true, 
      data,
      message: data?.message || "Email verified and account activated"
    };
  } catch (error: any) {
    console.error('Error manually confirming user email:', error);
    return { 
      success: false, 
      message: error.message || "Failed to confirm user email" 
    };
  }
}
