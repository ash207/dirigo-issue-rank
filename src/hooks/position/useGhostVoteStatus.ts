
import { useState, useEffect } from "react";
import { checkIssueParticipation } from "./useGhostVoteServices";

/**
 * Hook to check if a user has participated in an issue's voting
 * Note: This only tracks participation in the issue, not which position was voted for
 */
export const useGhostVoteStatus = (
  issueId: string | undefined, 
  userId: string | undefined, 
  isAuthenticated: boolean,
  positionIds: string[],
  refreshTrigger: number
) => {
  const [hasParticipated, setHasParticipated] = useState(false);

  useEffect(() => {
    const checkParticipationStatus = async () => {
      // Reset participation status
      setHasParticipated(false);
      
      // Only check participation for authenticated users
      if (!isAuthenticated || !userId || !issueId) {
        return;
      }
      
      try {
        // Check if user has participated in this issue
        const participated = await checkIssueParticipation(userId, issueId);
        setHasParticipated(participated);
        console.log("Issue participation check result:", participated);
      } catch (error) {
        console.error("Error checking issue participation status:", error);
      }
    };
    
    checkParticipationStatus();
  }, [issueId, userId, isAuthenticated, refreshTrigger, positionIds]);

  // For backward compatibility, we map hasParticipated to hasGhostVoted
  // But we don't track which position was voted for
  return { 
    hasGhostVoted: hasParticipated, 
    ghostVotedPositionId: null 
  };
};
