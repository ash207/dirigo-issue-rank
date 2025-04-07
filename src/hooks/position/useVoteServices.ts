
import { supabase } from "@/integrations/supabase/client";
import { VotePrivacyLevel } from "@/components/positions/dialogs/VotePrivacyDialog";

// Check if a user has already cast a ghost vote on an issue
export const checkVoteTracking = async (
  userId: string,
  issueId: string
): Promise<boolean> => {
  try {
    const { data: functionData } = await supabase.functions.invoke('check-vote-tracking', {
      method: 'POST',
      body: {
        user_id: userId,
        issue_id: issueId
      }
    });
    
    return functionData?.exists || false;
  } catch (error) {
    console.error("Error checking vote tracking:", error);
    throw new Error("Failed to verify your voting status");
  }
};

// Record a ghost vote tracking entry
export const trackGhostVote = async (
  userId: string,
  issueId: string,
  positionId: string
): Promise<void> => {
  try {
    const { error } = await supabase.functions.invoke('check-vote-tracking', {
      method: 'PUT',
      body: {
        user_id: userId,
        issue_id: issueId,
        position_id: positionId
      }
    });
    
    if (error) {
      console.error("Error tracking ghost vote:", error);
      throw new Error("Failed to record your vote tracking");
    }
  } catch (error) {
    console.error("Error tracking ghost vote:", error);
    throw new Error("Failed to track your ghost vote");
  }
};

// Delete a vote tracking record
export const deleteVoteTracking = async (
  userId: string,
  issueId: string
): Promise<void> => {
  try {
    const { error } = await supabase.functions.invoke('delete-vote-tracking', {
      method: 'POST',
      body: {
        user_id: userId,
        issue_id: issueId
      }
    });
    
    if (error) {
      console.error("Error removing ghost vote tracking:", error);
      throw new Error("Failed to remove your vote tracking");
    }
  } catch (error) {
    console.error("Error removing ghost vote tracking:", error);
    throw new Error("Failed to remove your vote tracking");
  }
};

// Cast a ghost vote
export const castGhostVote = async (
  positionId: string
): Promise<void> => {
  try {
    const { error } = await supabase.rpc('increment_anonymous_vote', {
      p_position_id: positionId
    });
    
    if (error) {
      console.error("Database error for ghost vote:", error);
      throw new Error("Failed to record your ghost vote");
    }
  } catch (error) {
    console.error("Error casting ghost vote:", error);
    throw new Error("Failed to cast your ghost vote");
  }
};

// Cast a public vote
export const castPublicVote = async (
  positionId: string,
  userId: string,
  privacyLevel: VotePrivacyLevel,
  issueId: string
): Promise<void> => {
  try {
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
    throw new Error("Failed to cast your public vote");
  }
};

// Remove an existing vote
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
