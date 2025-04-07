
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { VotePrivacyLevel } from "@/components/positions/dialogs/VotePrivacyDialog";

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
