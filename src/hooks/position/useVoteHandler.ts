
import { useState } from "react";
import { toast } from "sonner";
import { VotePrivacyLevel } from "@/components/positions/dialogs/VotePrivacyDialog";
import { useVoteDialog } from "./useVoteDialog";
import { useVoteState } from "./useVoteState";
import { processVoteRequest } from "./useVoteProcessor";
import { executeVoteAction } from "./useVoteExecutor";

export const useVoteHandler = (
  issueId: string | undefined, 
  userId: string | undefined, 
  isAuthenticated: boolean, 
  userVotedPosition: string | null,
  setUserVotedPosition: (positionId: string | null) => void,
  positionVotes: Record<string, number>,
  setPositionVotes: React.Dispatch<React.SetStateAction<Record<string, number>>>,
  isActiveUser: boolean = false,
  refreshVotes?: () => void,
  hasGhostVoted: boolean = false,
  ghostVotedPositionId: string | null = null
) => {
  const { isVoting, setIsVoting } = useVoteState();
  const {
    showPrivacyDialog,
    setShowPrivacyDialog,
    pendingVotePositionId,
    setPendingVotePositionId,
    startVoteProcess,
    resetVoteDialog
  } = useVoteDialog();

  // Debug log
  console.log("useVoteHandler:", { 
    issueId, 
    userId, 
    isAuthenticated, 
    userVotedPosition, 
    isActiveUser,
    hasGhostVoted,
    ghostVotedPositionId
  });

  // Handle vote functionality
  const handleVote = async (positionId: string, privacyLevel?: VotePrivacyLevel) => {
    console.log("handleVote called:", { 
      positionId, 
      privacyLevel, 
      issueId, 
      hasGhostVoted,
      ghostVotedPositionId
    });
    
    // Process the vote request and determine the appropriate action
    const processResult = await processVoteRequest(
      userId, 
      issueId, 
      positionId, 
      privacyLevel, 
      isAuthenticated, 
      isActiveUser,
      userVotedPosition,
      hasGhostVoted,
      ghostVotedPositionId
    );
    
    // If we need to show the privacy dialog, do that and exit early
    if (processResult.shouldShowPrivacyDialog) {
      startVoteProcess(positionId);
      return;
    }
    
    // If the request is invalid, show an error and exit
    if (!processResult.isValidRequest) {
      if (processResult.errorMessage) {
        toast.error(processResult.errorMessage);
      }
      return;
    }
    
    // Now we can proceed with the vote operation
    setIsVoting(true);
    
    try {
      // We can safely cast userId and issueId here since we've validated them
      const validUserId = userId as string;
      const validIssueId = issueId as string;
      
      // Execute the appropriate vote action
      const actionSuccess = await executeVoteAction({
        voteAction: processResult.voteAction,
        positionId,
        userId: validUserId,
        issueId: validIssueId,
        privacyLevel,
        userVotedPosition,
        setUserVotedPosition,
        positionVotes,
        setPositionVotes,
        hasGhostVoted,
        ghostVotedPositionId,
        setIsVoting,
        resetVoteDialog,
        refreshVotes
      });
      
      if (!actionSuccess) {
        console.error("Vote action failed");
      }
    } catch (error: any) {
      console.error("Error voting:", error);
      toast.error(error.message || "Failed to process your vote");
    } finally {
      setIsVoting(false);
      resetVoteDialog();
    }
  };

  return {
    handleVote,
    isVoting,
    showPrivacyDialog,
    setShowPrivacyDialog,
    pendingVotePositionId,
    hasGhostVoted,
    ghostVotedPositionId
  };
};
