
import { useFetchVotes } from "./useFetchVotes";
import { useVoteHandler } from "./useVoteHandler";
import { VotePrivacyLevel } from "@/components/positions/dialogs/VotePrivacyDialog";

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

  const handleVoteWithPrivacy = (positionId: string, privacyLevel?: VotePrivacyLevel) => {
    handleVote(positionId, privacyLevel);
  };

  return { 
    userVotedPosition, 
    positionVotes, 
    handleVote: handleVoteWithPrivacy, 
    isActiveUser 
  };
};

export default usePositionVotes;
