
import { useFetchVotes } from "./useFetchVotes";
import { useVoteHandler } from "./useVoteHandler";

export const usePositionVotes = (issueId: string | undefined, userId: string | undefined, isAuthenticated: boolean) => {
  const { 
    userVotedPosition, 
    positionVotes, 
    setUserVotedPosition, 
    setPositionVotes,
    isActiveUser
  } = useFetchVotes(issueId, userId, isAuthenticated);
  
  const { handleVote } = useVoteHandler(
    issueId, 
    userId, 
    isAuthenticated, 
    userVotedPosition, 
    setUserVotedPosition,
    positionVotes,
    setPositionVotes,
    isActiveUser
  );

  return { 
    userVotedPosition, 
    positionVotes, 
    handleVote, 
    isActiveUser 
  };
};

export default usePositionVotes;
