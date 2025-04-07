
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { VotePrivacyLevel } from "@/components/positions/dialogs/VotePrivacyDialog";
import { updatePositionVote, updatePositionVoteCount, getPositionVoteCount } from "./useVoteUtils";

// Handle first-time voting
export const handleNewVote = async (
  positionId: string,
  userId: string,
  issueId: string,
  privacyLevel: VotePrivacyLevel | undefined,
  setPositionVotes: React.Dispatch<React.SetStateAction<Record<string, number>>>
) => {
  try {
    // Get current vote count before updating
    const currentCount = await getPositionVoteCount(positionId);
    const newCount = currentCount + 1;
    
    if (privacyLevel === 'super_anonymous') {
      // Use the dedicated RPC function for super anonymous votes
      const { error } = await supabase.rpc('cast_super_anonymous_vote', {
        p_issue_id: issueId,
        p_position_id: positionId
      });
      
      if (error) throw error;
      
      // Fetch the updated vote count
      const updatedCount = await getPositionVoteCount(positionId);
      
      // Update local state
      updatePositionVote(positionId, updatedCount, setPositionVotes);
      console.log(`Updated vote count for position ${positionId} to ${updatedCount}`);
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
      
      // Update the position's vote count
      const updatedCount = await updatePositionVoteCount(positionId, newCount);
      
      // Update local state immediately
      updatePositionVote(positionId, updatedCount, setPositionVotes);
      console.log(`Set vote count for position ${positionId} to ${updatedCount}`);
    }
    
    toast.success("Your vote has been recorded!");
  } catch (error) {
    console.error("Error in handleNewVote:", error);
    toast.error("Failed to save your vote. Please try again.");
    throw error;
  }
};
