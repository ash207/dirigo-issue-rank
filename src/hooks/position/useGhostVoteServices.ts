
import { supabase } from "@/integrations/supabase/client";

/**
 * Cast a ghost vote - completely anonymous with no user tracking
 */
export const castGhostVote = async (
  positionId: string
): Promise<void> => {
  try {
    // Call the Supabase RPC function to increment the anonymous vote count
    // This is truly anonymous - no user tracking is performed
    const { error } = await supabase.rpc('increment_anonymous_vote', {
      p_position_id: positionId
    });
    
    if (error) {
      console.error("Database error for ghost vote:", error);
      throw new Error("Failed to record your anonymous vote");
    }
  } catch (error) {
    console.error("Error casting ghost vote:", error);
    throw new Error("Failed to cast your anonymous vote");
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
