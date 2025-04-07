
import { useState } from "react";
import { useFetchVotes } from "./useFetchVotes";
import { useVoteHandler } from "./useVoteHandler";
import { useAuth } from "@/contexts/AuthContext";
import { VotePrivacyLevel } from "@/components/positions/dialogs/VotePrivacyDialog";

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
    refreshVotes
  } = useFetchVotes(issueId, user?.id, isAuthenticated);

  const {
    handleVote,
    isVoting
  } = useVoteHandler(
    issueId, 
    user?.id, 
    isAuthenticated, 
    userVotedPosition, 
    setUserVotedPosition, 
    positionVotes, 
    setPositionVotes,
    isActiveUser,
    refreshVotes
  );

  return {
    userVotedPosition,
    positionVotes,
    handleVote,
    isVoting,
    isActiveUser
  };
};

export default usePositionVotes;
