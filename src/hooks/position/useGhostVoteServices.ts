
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
    // Call the Edge Function that handles anonymous voting
    const { error } = await supabase.functions.invoke('cast-ghost-vote', {
      body: { 
        positionId, 
        issueId, 
        userId 
      }
    });
    
    if (error) {
      console.error("Error invoking ghost vote function:", error);
      throw new Error("Failed to record your anonymous vote");
    }
  } catch (error) {
    console.error("Error casting ghost vote:", error);
    throw new Error("Failed to cast your anonymous vote");
  }
};

// Get user's issue participation without revealing which positions they voted for
export const checkIssueParticipation = async (
  userId: string,
  issueId: string
): Promise<boolean> => {
  if (!userId || !issueId) return false;
  
  try {
    const { data, error } = await supabase
      .from('user_issue_participation')
      .select('*')
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
