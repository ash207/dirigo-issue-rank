
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { VotePrivacyLevel } from "@/components/positions/dialogs/VotePrivacyDialog";
import { updatePositionVote, updatePositionVoteCount, getPositionVoteCount } from "./useVoteUtils";

// Handle changing a vote from one position to another
export const handleChangeVote = async (
  userVotedPosition: string,
  positionId: string,
  userId: string,
  issueId: string,
  privacyLevel: VotePrivacyLevel | undefined,
  setPositionVotes: React.Dispatch<React.SetStateAction<Record<string, number>>>
) => {
  console.log(`Changing vote from ${userVotedPosition} to ${positionId}`);
  
  try {
    // First, get the current vote counts
    const oldPositionCount = await getPositionVoteCount(userVotedPosition);
    const newPositionCount = await getPositionVoteCount(positionId);
    
    // Calculate new votes for both positions
    const oldPositionNewVotes = Math.max(0, oldPositionCount - 1);
    const newPositionNewVotes = newPositionCount + 1;
    
    // Update the old position by decreasing its vote count
    const updatedOldCount = await updatePositionVoteCount(userVotedPosition, oldPositionNewVotes);
    
    // Update local state for the old position immediately
    updatePositionVote(userVotedPosition, updatedOldCount, setPositionVotes);
    console.log(`Decreased vote count for position ${userVotedPosition} to ${updatedOldCount}`);
    
    // Delete the old vote record
    await supabase
      .from('user_votes')
      .delete()
      .eq('user_id', userId)
      .eq('issue_id', issueId);
    
    // Handle the new vote based on privacy level
    if (privacyLevel === 'super_anonymous') {
      // Use the dedicated RPC function for super anonymous votes
      const { error } = await supabase.rpc('cast_super_anonymous_vote', {
        p_issue_id: issueId,
        p_position_id: positionId
      });
      
      if (error) throw error;
      
      // Fetch the updated position vote count
      const updatedNewCount = await getPositionVoteCount(positionId);
      
      // Update local state for the new position
      updatePositionVote(positionId, updatedNewCount, setPositionVotes);
      console.log(`Increased vote count for position ${positionId} to ${updatedNewCount}`);
    } else {
      // Insert regular vote with specified privacy
      const { error } = await supabase
        .from('user_votes')
        .insert({
          user_id: userId,
          issue_id: issueId,
          position_id: positionId,
          privacy_level: privacyLevel || 'public'
        });
      
      if (error) throw error;
      
      // Update the new position by increasing its vote count
      const updatedNewCount = await updatePositionVoteCount(positionId, newPositionNewVotes);
      
      // Update local state for the new position
      updatePositionVote(positionId, updatedNewCount, setPositionVotes);
      console.log(`Increased vote count for position ${positionId} to ${updatedNewCount}`);
    }
    
    toast.success("Your vote has been updated!");
  } catch (error) {
    console.error("Error in handleChangeVote:", error);
    toast.error("Failed to update your vote. Please try again.");
    throw error;
  }
};
