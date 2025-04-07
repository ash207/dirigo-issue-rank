
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
