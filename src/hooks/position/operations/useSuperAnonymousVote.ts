
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
