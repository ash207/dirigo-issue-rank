
import { toast } from "sonner";
import { removeVote } from "../useVoteServices";
import { VoteActionParams } from "../types/voteActionTypes";

/**
 * Handle removing a vote from one position and casting to another
 * This function is now only used for ghost votes or special cases
 * Most vote switching is handled directly in handlePublicVote
 */
export const handleChangeVote = async ({
  positionId,
  userId,
  userVotedPosition,
  setPositionVotes
}: VoteActionParams) => {
  if (!userVotedPosition || userVotedPosition === positionId) {
    return true; // Nothing to change
  }
  
  try {
    await removeVote(userVotedPosition, userId);
    
    // Update local state for previous vote
    setPositionVotes(prev => ({
      ...prev,
      [userVotedPosition]: Math.max(0, (prev[userVotedPosition] || 0) - 1)
    }));
    
    return true;
  } catch (error) {
    console.error("Error changing vote:", error);
    toast.error("Failed to change your vote");
    return false;
  }
};
