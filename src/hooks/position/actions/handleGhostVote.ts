
import { toast } from "sonner";
import { castGhostVote } from "../useGhostVoteServices";
import { removeVote } from "../useVoteServices";
import { VoteActionParams } from "../types/voteActionTypes";

/**
 * Handle casting a ghost vote
 */
export const handleGhostVote = async ({
  positionId,
  userId,
  issueId,
  userVotedPosition,
  setUserVotedPosition,
  setPositionVotes,
  setIsVoting,
  resetVoteDialog
}: VoteActionParams) => {
  try {
    console.log("Starting ghost vote process", { positionId, userVotedPosition });
    
    // If the user has an existing public vote, remove it first
    if (userVotedPosition) {
      console.log("Removing existing public vote before ghost vote", userVotedPosition);
      
      // Remove the existing public vote from the database
      await removeVote(userVotedPosition, userId);
      
      // Update local state to reflect the removal
      setPositionVotes(prev => ({
        ...prev,
        [userVotedPosition]: Math.max(0, (prev[userVotedPosition] || 0) - 1)
      }));
      
      // Clear the user's voted position since we're switching to ghost vote
      setUserVotedPosition(null);
    }
    
    // Cast a truly anonymous vote using the Edge Function
    console.log("Casting ghost vote", { positionId, issueId, userId });
    const response = await castGhostVote(
      positionId, 
      issueId, // Passing issueId for participation tracking
      userId   // Passing userId for participation tracking
    );
    console.log("Ghost vote response:", response);
    
    // Update local state to show the vote count increasing
    setPositionVotes(prev => ({
      ...prev,
      [positionId]: (prev[positionId] || 0) + 1
    }));
    
    toast.success("Anonymous vote recorded");
    return true;
  } catch (error) {
    console.error("Ghost vote failed:", error);
    toast.error(error instanceof Error ? error.message : "Failed to record your anonymous vote");
    return false;
  } finally {
    setIsVoting(false);
    resetVoteDialog();
  }
};
