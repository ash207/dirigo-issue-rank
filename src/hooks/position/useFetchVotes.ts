
import { useState } from "react";
import { useUserStatus } from "./useUserStatus";
import { usePositionIds } from "./usePositionIds";
import { useGhostVoteStatus } from "./useGhostVoteStatus";
import { usePositionVotesData } from "./usePositionVotesData";

/**
 * Main hook for fetching and managing votes for positions on an issue
 */
export const useFetchVotes = (
  issueId: string | undefined, 
  userId: string | undefined, 
  isAuthenticated: boolean
) => {
  const [lastVoteTime, setLastVoteTime] = useState(0);
  
  // Fetch user account status
  const { isActiveUser } = useUserStatus(userId, isAuthenticated);
  
  // Fetch position IDs for this issue
  const { positionIds } = usePositionIds(issueId, lastVoteTime);
  
  // Check ghost vote status
  const { hasGhostVoted, ghostVotedPositionId } = useGhostVoteStatus(
    issueId, 
    userId, 
    isAuthenticated, 
    positionIds,
    lastVoteTime
  );
  
  // Fetch position votes data
  const { 
    positionVotes, 
    userVotedPosition, 
    setUserVotedPosition, 
    setPositionVotes
  } = usePositionVotesData(
    issueId, 
    userId, 
    isAuthenticated, 
    positionIds,
    lastVoteTime
  );

  // Expose a method to force refresh vote data
  const refreshVotes = () => {
    setLastVoteTime(Date.now());
  };

  return {
    userVotedPosition,
    positionVotes,
    setUserVotedPosition,
    setPositionVotes,
    isActiveUser,
    refreshVotes,
    hasGhostVoted,
    ghostVotedPositionId
  };
};
