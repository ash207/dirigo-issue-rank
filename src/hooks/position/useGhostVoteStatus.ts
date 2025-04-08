
import { useState, useEffect } from "react";
import { checkVoteTracking } from "./useVoteServices";

/**
 * Hook to check if a user has a ghost vote on an issue
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
      if (!isAuthenticated || !userId || !issueId) {
        setHasGhostVoted(false);
        setGhostVotedPositionId(null);
        return;
      }
      
      try {
        // Use the edge function to check if this user has a ghost vote on this issue
        const result = await checkVoteTracking(userId, issueId);
        console.log("Ghost vote check result:", result);
        
        // If the position doesn't exist in our current positions list, 
        // or the API tells us it doesn't exist in the database, reset the ghost vote status
        if (result.exists && result.position_id) {
          // Check if position exists in the positions list and the API confirms it exists
          const positionExists = positionIds.includes(result.position_id) && result.position_exists !== false;
          
          if (positionExists) {
            // Valid ghost vote exists
            setHasGhostVoted(true);
            setGhostVotedPositionId(result.position_id);
          } else {
            // Ghost vote is for a position that no longer exists or is not in this issue
            console.log("Ghost voted position no longer exists, allowing new votes");
            setHasGhostVoted(false);
            setGhostVotedPositionId(null);
          }
        } else {
          // No ghost vote exists
          setHasGhostVoted(false);
          setGhostVotedPositionId(null);
        }
        
        console.log("Ghost vote status updated:", { 
          hasGhostVoted: result.exists && (result.position_id ? positionIds.includes(result.position_id) : false), 
          ghostVotedPositionId: result.position_id
        });
      } catch (error) {
        console.error("Error checking ghost vote status:", error);
        setHasGhostVoted(false);
        setGhostVotedPositionId(null);
      }
    };
    
    checkGhostVoteStatus();
  }, [issueId, userId, isAuthenticated, refreshTrigger, positionIds]);

  return { hasGhostVoted, ghostVotedPositionId };
};
