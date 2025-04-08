
import { useFetchVotes } from "./useFetchVotes";
import { useVoteHandler } from "./useVoteHandler";
import { useAuth } from "@/contexts/AuthContext";

export const usePositionVotes = (issueId: string) => {
  const { user, isAuthenticated } = useAuth();
  
  // Debug log
  console.log("UsePositionVotes hook:", { issueId, userId: user?.id, isAuthenticated });
  
  const {
    userVotedPosition,
    positionVotes,
    setUserVotedPosition,
    setPositionVotes,
    isActiveUser,
    refreshVotes,
    hasGhostVoted,
    ghostVotedPositionId
  } = useFetchVotes(issueId, user?.id, isAuthenticated);

  // Additional log to debug ghost vote status
  console.log("Ghost vote status in usePositionVotes:", { hasGhostVoted, ghostVotedPositionId });

  const {
    handleVote,
    isVoting,
    hasGhostVoted: handlerGhostVoted,
    ghostVotedPositionId: handlerGhostVotedPositionId
  } = useVoteHandler(
    issueId, 
    user?.id, 
    isAuthenticated, 
    userVotedPosition, 
    setUserVotedPosition, 
    positionVotes, 
    setPositionVotes,
    isActiveUser,
    refreshVotes,
    hasGhostVoted,
    ghostVotedPositionId
  );

  return {
    userVotedPosition,
    positionVotes,
    handleVote,
    isVoting,
    isActiveUser,
    hasGhostVoted,
    ghostVotedPositionId
  };
};

export default usePositionVotes;
