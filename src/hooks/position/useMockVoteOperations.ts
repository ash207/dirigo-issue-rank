
import { toast } from "sonner";
import { updatePositionVote } from "./useVoteUtils";

// Handle voting for mock data (non-UUID IDs)
export const handleMockVote = (
  userVotedPosition: string | null,
  positionId: string,
  positionVotes: Record<string, number>,
  setUserVotedPosition: (positionId: string | null) => void,
  setPositionVotes: React.Dispatch<React.SetStateAction<Record<string, number>>>
) => {
  // If already voted for this position, unvote
  if (userVotedPosition === positionId) {
    setUserVotedPosition(null);
    // Update local state for the position that was unvoted
    updatePositionVote(
      positionId, 
      Math.max(0, (positionVotes[positionId] || 1) - 1),
      setPositionVotes
    );
    toast.success("Your vote has been removed! (Mock)");
  } else {
    // If switching vote, decrease count on old position
    if (userVotedPosition) {
      updatePositionVote(
        userVotedPosition, 
        Math.max(0, (positionVotes[userVotedPosition] || 1) - 1),
        setPositionVotes
      );
    }
    // Increase count on new position
    updatePositionVote(
      positionId, 
      (positionVotes[positionId] || 0) + 1,
      setPositionVotes
    );
    setUserVotedPosition(positionId);
    toast.success("Your vote has been recorded! (Mock)");
  }
};
