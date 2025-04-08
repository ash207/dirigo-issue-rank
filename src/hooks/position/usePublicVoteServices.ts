
import { supabase } from "@/integrations/supabase/client";
import { VotePrivacyLevel } from "@/components/positions/dialogs/VotePrivacyDialog";
import { checkVoteTracking } from "./useGhostVoteServices";

/**
 * Cast a public vote
 */
export const castPublicVote = async (
  positionId: string,
  userId: string,
  privacyLevel: VotePrivacyLevel,
  issueId: string
): Promise<void> => {
  try {
    // Check for existing ghost vote first
    const existingGhostVote = await checkVoteTracking(userId, issueId);
    
    if (existingGhostVote.exists) {
      throw new Error("You've already cast a ghost vote on this issue and cannot cast a public vote");
    }
    
    const { error } = await supabase
      .from('position_votes')
      .insert({
        position_id: positionId,
        user_id: userId,
        privacy_level: privacyLevel,
        issue_id: issueId
      })
      .select();
    
    if (error) {
      console.error("Database error:", error);
      throw new Error("Failed to record your vote");
    }
  } catch (error) {
    console.error("Error casting public vote:", error);
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error("Failed to cast your public vote");
    }
  }
};

/**
 * Remove an existing vote
 */
export const removeVote = async (
  positionId: string,
  userId: string
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('position_votes')
      .delete()
      .eq('position_id', positionId)
      .eq('user_id', userId);
    
    if (error) {
      console.error("Error removing vote:", error);
      throw new Error("Failed to remove your vote");
    }
  } catch (error) {
    console.error("Error removing vote:", error);
    throw new Error("Failed to remove your vote");
  }
};
