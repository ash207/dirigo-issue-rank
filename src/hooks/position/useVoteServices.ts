
import { supabase } from "@/integrations/supabase/client";
import { VotePrivacyLevel } from "@/components/positions/dialogs/VotePrivacyDialog";
import { castGhostVote, checkIssueParticipation } from "./useGhostVoteServices";

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
    const hasGhostVoted = await checkIssueParticipation(userId, issueId);
    
    if (hasGhostVoted) {
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
 * Switch vote from one position to another
 */
export const switchVote = async (
  oldPositionId: string,
  newPositionId: string,
  userId: string,
  privacyLevel: VotePrivacyLevel,
  issueId: string
): Promise<void> => {
  try {
    // First check if the user has a ghost vote
    const hasGhostVoted = await checkIssueParticipation(userId, issueId);
    
    if (hasGhostVoted) {
      throw new Error("You've already cast a ghost vote on this issue and cannot switch your vote");
    }
    
    // Start a transaction through the RPC function if supported
    // Or use direct SQL if needed
    // For now, we'll use a simpler approach: delete and insert
    const { error: deleteError } = await supabase
      .from('position_votes')
      .delete()
      .eq('position_id', oldPositionId)
      .eq('user_id', userId);
    
    if (deleteError) {
      console.error("Error removing old vote:", deleteError);
      throw new Error("Failed to switch your vote");
    }
    
    const { error: insertError } = await supabase
      .from('position_votes')
      .insert({
        position_id: newPositionId,
        user_id: userId,
        privacy_level: privacyLevel,
        issue_id: issueId
      })
      .select();
    
    if (insertError) {
      console.error("Error adding new vote:", insertError);
      throw new Error("Failed to switch your vote");
    }
  } catch (error) {
    console.error("Error switching vote:", error);
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error("Failed to switch your vote");
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
