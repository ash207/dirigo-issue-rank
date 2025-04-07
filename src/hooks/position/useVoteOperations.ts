
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { VotePrivacyLevel } from "@/components/positions/dialogs/VotePrivacyDialog";

/**
 * Handles removing a vote
 */
export const removeVote = async (
  userId: string,
  issueId: string,
  userVotedPosition: string,
  updatePositionVote: (positionId: string, newCount: number) => void
) => {
  try {
    // Get current vote count for the position
    const { data: oldPosition } = await supabase
      .from('positions')
      .select('votes')
      .eq('id', userVotedPosition)
      .single();
      
    if (oldPosition) {
      // Decrement vote count
      const newCount = Math.max(0, oldPosition.votes - 1);
      await supabase
        .from('positions')
        .update({ votes: newCount })
        .eq('id', userVotedPosition);
      
      // Update local state
      updatePositionVote(userVotedPosition, newCount);
    }
    
    // Delete the vote record
    await supabase
      .from('user_votes')
      .delete()
      .eq('user_id', userId)
      .eq('issue_id', issueId);
    
    toast.success("Your vote has been removed!");
    return true;
  } catch (error) {
    console.error("Error removing vote:", error);
    toast.error("Failed to remove your vote. Please try again.");
    return false;
  }
};

/**
 * Handles the super anonymous vote functionality
 */
export const handleSuperAnonymousVote = async (
  userId: string,
  issueId: string,
  positionId: string,
  oldPositionId: string | null,
  positionVotes: Record<string, number>,
  updatePositionVote: (positionId: string, newCount: number) => void
) => {
  try {
    // If changing from a previous position, decrement old position count
    if (oldPositionId) {
      const { data: oldPosition } = await supabase
        .from('positions')
        .select('votes')
        .eq('id', oldPositionId)
        .single();
        
      if (oldPosition) {
        const newCount = Math.max(0, oldPosition.votes - 1);
        await supabase
          .from('positions')
          .update({ votes: newCount })
          .eq('id', oldPositionId);
        
        // Update local state for old position
        updatePositionVote(oldPositionId, newCount);
      }
      
      // Delete the old vote record
      await supabase
        .from('user_votes')
        .delete()
        .eq('user_id', userId)
        .eq('issue_id', issueId);
    }
    
    // Increment the position vote count
    const { data: position } = await supabase
      .from('positions')
      .select('votes')
      .eq('id', positionId)
      .single();
      
    if (position) {
      const newCount = position.votes + 1;
      await supabase
        .from('positions')
        .update({ votes: newCount })
        .eq('id', positionId);
      
      // Update local state
      updatePositionVote(positionId, newCount);
    }
    
    // Create a record that only tracks the issue, with null position_id
    const { error } = await supabase
      .from('user_votes')
      .insert({
        user_id: userId,
        issue_id: issueId,
        position_id: null,
        privacy_level: 'super_anonymous'
      });
    
    if (error) throw error;
    
    toast.success(oldPositionId 
      ? "Your vote has been updated with super anonymity!" 
      : "Your vote has been recorded with super anonymity!");
    return true;
  } catch (error) {
    console.error("Error handling super anonymous vote:", error);
    toast.error("Failed to save your vote. Please try again.");
    return false;
  }
};

/**
 * Handles standard (public/anonymous) votes
 */
export const handleStandardVote = async (
  userId: string,
  issueId: string,
  positionId: string,
  oldPositionId: string | null,
  positionVotes: Record<string, number>,
  updatePositionVote: (positionId: string, newCount: number) => void,
  privacyLevel: VotePrivacyLevel | string = 'public'
) => {
  try {
    // If changing from a previous position, decrement old position count
    if (oldPositionId) {
      const { data: oldPosition } = await supabase
        .from('positions')
        .select('votes')
        .eq('id', oldPositionId)
        .single();
        
      if (oldPosition) {
        const newCount = Math.max(0, oldPosition.votes - 1);
        await supabase
          .from('positions')
          .update({ votes: newCount })
          .eq('id', oldPositionId);
        
        // Update local state for old position
        updatePositionVote(oldPositionId, newCount);
      }
      
      // Delete the old vote record
      await supabase
        .from('user_votes')
        .delete()
        .eq('user_id', userId)
        .eq('issue_id', issueId);
    }
    
    // Add the new vote record
    const { error } = await supabase
      .from('user_votes')
      .insert({
        user_id: userId,
        issue_id: issueId,
        position_id: positionId,
        privacy_level: privacyLevel
      });
    
    if (error) throw error;
    
    // Increment the vote count on the new position
    const { data: newPosition } = await supabase
      .from('positions')
      .select('votes')
      .eq('id', positionId)
      .single();
      
    if (newPosition) {
      const newCount = newPosition.votes + 1;
      await supabase
        .from('positions')
        .update({ votes: newCount })
        .eq('id', positionId);
      
      // Update local state for the new position
      updatePositionVote(positionId, newCount);
    }
    
    toast.success(oldPositionId 
      ? "Your vote has been updated!" 
      : "Your vote has been recorded!");
    return true;
  } catch (error) {
    console.error("Error handling standard vote:", error);
    toast.error("Failed to save your vote. Please try again.");
    return false;
  }
};
