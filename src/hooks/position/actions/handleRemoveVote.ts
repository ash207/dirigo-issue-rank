
import { toast } from "sonner";
import { removeVote } from "../useVoteServices";

/**
 * Handle removing an existing vote
 */
export const handleRemoveVote = async ({
  positionId,
  userId,
  setUserVotedPosition,
  setPositionVotes,
  setIsVoting,
  resetVoteDialog
}: VoteActionParams) => {
  try {
    await removeVote(positionId, userId);
    
    // Update local state
    setUserVotedPosition(null);
    setPositionVotes(prev => ({
      ...prev,
      [positionId]: Math.max(0, (prev[positionId] || 0) - 1)
    }));
    
    toast.success("Vote removed");
    return true;
  } catch (error) {
    console.error("Error removing vote:", error);
    toast.error(error instanceof Error ? error.message : "Failed to remove your vote");
    return false;
  } finally {
    setIsVoting(false);
    resetVoteDialog();
  }
};
