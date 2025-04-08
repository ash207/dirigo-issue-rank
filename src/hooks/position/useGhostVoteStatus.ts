
import { useState, useEffect } from "react";
import { checkVoteTracking } from "./useVoteServices";

/**
 * Hook to check if a user has a ghost vote on an issue
 * Note: With the new truly anonymous system, this will always return false
 * as ghost votes are no longer tracked per user
 */
export const useGhostVoteStatus = (
  issueId: string | undefined, 
  userId: string | undefined, 
  isAuthenticated: boolean,
  positionIds: string[],
  refreshTrigger: number
) => {
  const [hasGhostVoted, setHasGhostVoted] = useState(false);
  const [ghostVotedPositionId, setGhostVotedPositionId] = useState<string | null>(null);

  useEffect(() => {
    const checkGhostVoteStatus = async () => {
      // With the new truly anonymous voting system, we don't track ghost votes by user
      // So we always set hasGhostVoted to false
      setHasGhostVoted(false);
      setGhostVotedPositionId(null);
      
      // The code below is kept for legacy purposes but will always return false now
      if (!isAuthenticated || !userId || !issueId) {
        return;
      }
      
      try {
        // This will always return {exists: false, position_id: null} now
        const result = await checkVoteTracking(userId, issueId);
        console.log("Ghost vote check result (will always be false now):", result);
      } catch (error) {
        console.error("Error checking ghost vote status:", error);
      }
    };
    
    checkGhostVoteStatus();
  }, [issueId, userId, isAuthenticated, refreshTrigger, positionIds]);

  return { hasGhostVoted, ghostVotedPositionId };
};
