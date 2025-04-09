
import { supabase } from "@/integrations/supabase/client";

/**
 * Cast a ghost vote - completely anonymous with no user tracking
 * This uses a secure Edge Function to ensure true anonymity
 */
export const castGhostVote = async (
  positionId: string,
  issueId?: string,
  userId?: string
): Promise<void> => {
  try {
    console.log("Calling ghost vote edge function with:", { positionId, issueId, userId });
    
    // Call the Edge Function that handles anonymous voting
    const { data, error } = await supabase.functions.invoke('cast-ghost-vote', {
      body: { 
        positionId, 
        issueId, 
        userId 
      }
    });
    
    console.log("Edge function response:", { data, error });
    
    if (error) {
      console.error("Error invoking ghost vote function:", error);
      throw new Error("Failed to record your anonymous vote");
    }
    
    // Record participation in user_issue_participation if issueId and userId are provided
    if (issueId && userId) {
      await recordIssueParticipation(userId, issueId);
    }
    
    return data;
  } catch (error) {
    console.error("Error casting ghost vote:", error);
    throw new Error("Failed to cast your anonymous vote");
  }
};

// Record that a user has participated in an issue without revealing which position
// This maintains the anonymity of the ghost vote while allowing us to prevent multiple votes
async function recordIssueParticipation(userId: string, issueId: string): Promise<void> {
  try {
    console.log("Recording issue participation:", { userId, issueId });
    const { error } = await supabase
      .from('user_issue_participation')
      .upsert({
        user_id: userId,
        issue_id: issueId,
        participated_at: new Date().toISOString()
      })
      .select();
      
    if (error) {
      console.error("Error recording issue participation:", error);
      // Don't throw here - this is a secondary operation and shouldn't fail the main vote
    }
  } catch (error) {
    console.error("Error in recordIssueParticipation:", error);
    // Don't throw here - this is a secondary operation and shouldn't fail the main vote
  }
}

// Get user's issue participation without revealing which positions they voted for
export const checkIssueParticipation = async (
  userId: string,
  issueId: string
): Promise<boolean> => {
  if (!userId || !issueId) return false;
  
  try {
    // Use a raw query instead of RPC to avoid TypeScript errors
    const { data, error } = await supabase
      .from('user_issue_participation')
      .select('id')
      .eq('user_id', userId)
      .eq('issue_id', issueId)
      .maybeSingle();
    
    if (error) {
      console.error("Error checking issue participation:", error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error("Error checking issue participation:", error);
    return false;
  }
};

// Legacy functions preserved for backward compatibility but no longer track users
export const checkVoteTracking = async (
  userId: string,
  issueId: string
): Promise<{ exists: boolean; position_id: string | null; position_exists?: boolean }> => {
  // Always return no tracking for truly anonymous votes
  // This ensures ghost votes are no longer tracked per user
  return { exists: false, position_id: null, position_exists: false };
};

export const trackGhostVote = async (
  userId: string,
  issueId: string,
  positionId: string
): Promise<void> => {
  // This function is intentionally empty - we no longer track ghost votes to user accounts
  // Ghost votes are now truly anonymous
  return;
};

export const deleteVoteTracking = async (
  userId: string,
  issueId: string
): Promise<void> => {
  // This function is intentionally empty - we no longer track ghost votes to user accounts
  // Ghost votes are now truly anonymous
  return;
};
