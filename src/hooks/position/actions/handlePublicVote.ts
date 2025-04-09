
import { toast } from "sonner";
import { castPublicVote, switchVote } from "../useVoteServices";

/**
 * Handle casting a public vote
 */
export const handlePublicVote = async ({
  positionId,
  userId,
  issueId,
  setUserVotedPosition,
  setPositionVotes,
  privacyLevel,
  userVotedPosition,
  setIsVoting,
  resetVoteDialog
}: VoteActionParams) => {
  if (!privacyLevel) {
    console.error("Missing privacy level for public vote");
    toast.error("Invalid vote configuration");
    setIsVoting(false);
    resetVoteDialog();
    return false;
  }
  
  try {
    // If user already voted for another position, we'll switch the vote
    if (userVotedPosition && userVotedPosition !== positionId) {
      await switchVote(userVotedPosition, positionId, userId, privacyLevel, issueId);
      
      // Update local state for both positions
      setPositionVotes(prev => ({
        ...prev,
        [userVotedPosition]: Math.max(0, (prev[userVotedPosition] || 0) - 1),
        [positionId]: (prev[positionId] || 0) + 1
      }));
      
      toast.success("Your vote has been switched");
    } else {
      // For new public votes, create a vote record
      await castPublicVote(positionId, userId, privacyLevel, issueId);
      
      // Update local state
      setPositionVotes(prev => ({
        ...prev,
        [positionId]: (prev[positionId] || 0) + 1
      }));
      
      toast.success("Vote recorded");
    }
    
    // Update which position the user voted for
    setUserVotedPosition(positionId);
    return true;
  } catch (error) {
    console.error("Public vote failed:", error);
    toast.error(error instanceof Error ? error.message : "Failed to record your vote");
    return false;
  } finally {
    setIsVoting(false);
    resetVoteDialog();
  }
};
