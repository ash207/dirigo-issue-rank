
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { VotePrivacyLevel } from "@/components/positions/dialogs/VotePrivacyDialog";
import { updatePositionVote, updatePositionVoteCount, getPositionVoteCount } from "./useVoteUtils";

// Handle unvoting (removing a vote)
export const handleUnvote = async (
  userVotedPosition: string, 
  userId: string, 
  issueId: string,
  privacyLevel: VotePrivacyLevel | undefined,
  setPositionVotes: React.Dispatch<React.SetStateAction<Record<string, number>>>
) => {
  try {
    // Get current vote count before updating
    const currentCount = await getPositionVoteCount(userVotedPosition);
    const newCount = Math.max(0, currentCount - 1);
    
    // Update the position's vote count in the database
    const updatedCount = await updatePositionVoteCount(userVotedPosition, newCount);
    
    // Update local state to reflect the change immediately
    updatePositionVote(userVotedPosition, updatedCount, setPositionVotes);
    console.log(`Decreased vote count for position ${userVotedPosition} to ${updatedCount}`);
    
    // Delete the vote record (if not super anonymous)
    if (privacyLevel !== 'super_anonymous') {
      await supabase
        .from('user_votes')
        .delete()
        .eq('user_id', userId)
        .eq('issue_id', issueId);
    } else {
      // Use edge function instead of direct RPC
      const { error } = await supabase.functions.invoke("delete-vote-tracking", {
        body: { user_id: userId, issue_id: issueId }
      });
      
      if (error) {
        console.error("Error deleting vote tracking:", error);
        throw error;
      }
    }
    
    toast.success("Your vote has been removed!");
  } catch (error) {
    console.error("Error in handleUnvote:", error);
    toast.error("Failed to remove your vote. Please try again.");
    throw error;
  }
};
