
import { toast } from "sonner";

/**
 * Handles mock voting for non-UUID IDs (test/demo data)
 */
export const handleMockVote = (
  issueId: string,
  positionId: string,
  userId: string | undefined, 
  userVotedPosition: string | null,
  positionVotes: Record<string, number>,
  updatePositionVote: (positionId: string, newCount: number) => void,
  setUserVotedPosition: (positionId: string | null) => void,
  privacyLevel?: string
) => {
  console.log("Using mock voting for non-UUID IDs", { issueId, positionId, privacyLevel });
  
  // If already voted for this position, unvote
  if (userVotedPosition === positionId) {
    // Update local state for current position
    const currentVotes = positionVotes[positionId] || 0;
    updatePositionVote(positionId, Math.max(0, currentVotes - 1));
    setUserVotedPosition(null);
    toast.success("Your vote has been removed! (Mock)");
  } else if (userVotedPosition) {
    // User is changing vote from one position to another
    // Decrement old position vote
    const oldVotes = positionVotes[userVotedPosition] || 0;
    updatePositionVote(userVotedPosition, Math.max(0, oldVotes - 1));
    
    // Increment new position vote
    const newVotes = positionVotes[positionId] || 0;
    updatePositionVote(positionId, newVotes + 1);
    
    setUserVotedPosition(positionId);
    toast.success("Your vote has been updated! (Mock)");
  } else {
    // New vote
    const currentVotes = positionVotes[positionId] || 0;
    updatePositionVote(positionId, currentVotes + 1);
    setUserVotedPosition(positionId);
    toast.success("Your vote has been recorded! (Mock)");
  }
  
  return true;
};
