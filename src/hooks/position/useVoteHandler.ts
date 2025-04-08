
import { useState } from "react";
import { toast } from "sonner";
import { VotePrivacyLevel } from "@/components/positions/dialogs/VotePrivacyDialog";
import { useVoteDialog } from "./useVoteDialog";
import { useVoteState } from "./useVoteState";
import { validateVoteParams, validateGhostVoteState, determineVoteAction } from "./useVoteValidation";
import { handleRemoveVote, handleGhostVote, handlePublicVote, handleChangeVote } from "./useVoteActions";

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
    
    // Validate vote parameters
    const validation = validateVoteParams(userId, issueId, isAuthenticated, isActiveUser);
    if (!validation.isValid) {
      toast.error(validation.errorMessage);
      return;
    }

    // If user has already cast a ghost vote on this issue, they cannot make ANY new vote
    // except on the position they ghost voted on
    if (hasGhostVoted) {
      // If this is for the ghost-voted position and we're removing the vote (special admin case), allow it
      if (ghostVotedPositionId === positionId && userVotedPosition === positionId) {
        // Special case: allow admins to remove ghost votes
        console.log("Admin removing ghost vote, allowing operation");
      } else {
        // Block all other vote operations when a ghost vote exists
        toast.error("You've already cast a ghost vote on this issue and cannot cast another vote or change it");
        return;
      }
    }

    // Is the user removing a vote?
    const isRemovingVote = userVotedPosition === positionId;
    
    // If we're removing a vote, we don't need a privacy level
    if (isRemovingVote) {
      privacyLevel = undefined;
    }
    // If we need a privacy level but don't have one, show the dialog
    else if (!privacyLevel) {
      // No privacy level specified, but we need one for a new vote
      startVoteProcess(positionId);
      return;
    }

    // Now we can proceed with the vote operation
    setIsVoting(true);

    try {
      console.log("Processing vote:", { 
        isRemovingVote, 
        positionId, 
        userId, 
        privacyLevel,
        issueId,
        hasGhostVoted,
        ghostVotedPositionId
      });
      
      // We can safely cast userId and issueId here since we've validated them
      const validUserId = userId as string;
      const validIssueId = issueId as string;
      
      // Perform additional validation for ghost votes to prevent race conditions
      const ghostValidation = await validateGhostVoteState(
        validUserId, 
        validIssueId, 
        hasGhostVoted, 
        ghostVotedPositionId, 
        positionId, 
        isRemovingVote
      );
      
      if (!ghostValidation.isValid) {
        toast.error(ghostValidation.errorMessage);
        setIsVoting(false);
        resetVoteDialog();
        return;
      }
      
      // Determine the type of action we need to take
      const voteAction = determineVoteAction(isRemovingVote, privacyLevel);
      
      // If user already voted on a different position, remove that vote first
      if (userVotedPosition && userVotedPosition !== positionId && voteAction !== "remove") {
        const changeSuccess = await handleChangeVote({
          positionId,
          userId: validUserId,
          issueId: validIssueId,
          userVotedPosition,
          setUserVotedPosition,
          positionVotes,
          setPositionVotes,
          setIsVoting,
          resetVoteDialog,
          hasGhostVoted,
          ghostVotedPositionId
        });
        
        if (!changeSuccess) {
          setIsVoting(false);
          resetVoteDialog();
          return;
        }
      }

      // Handle the actual vote action
      let actionSuccess = false;
      
      switch (voteAction) {
        case "remove":
          actionSuccess = await handleRemoveVote({
            positionId,
            userId: validUserId,
            issueId: validIssueId,
            userVotedPosition,
            setUserVotedPosition,
            positionVotes,
            setPositionVotes,
            setIsVoting,
            resetVoteDialog,
            hasGhostVoted,
            ghostVotedPositionId
          });
          break;
          
        case "ghost":
          actionSuccess = await handleGhostVote({
            positionId,
            userId: validUserId,
            issueId: validIssueId,
            userVotedPosition,
            setUserVotedPosition,
            positionVotes,
            setPositionVotes,
            setIsVoting,
            resetVoteDialog,
            hasGhostVoted,
            ghostVotedPositionId
          });
          break;
          
        case "public":
          actionSuccess = await handlePublicVote({
            positionId,
            userId: validUserId,
            issueId: validIssueId,
            userVotedPosition,
            setUserVotedPosition,
            positionVotes,
            setPositionVotes,
            setIsVoting,
            resetVoteDialog,
            hasGhostVoted,
            ghostVotedPositionId,
            privacyLevel
          });
          break;
          
        case "need-privacy":
          // We should never get here due to earlier check
          console.error("Privacy level needed but not provided");
          toast.error("Vote configuration error");
          actionSuccess = false;
          break;
      }

      // Refresh votes if callback provided and action succeeded
      if (refreshVotes && actionSuccess) {
        refreshVotes();
      }
    } catch (error: any) {
      console.error("Error voting:", error);
      toast.error(error.message || "Failed to process your vote");
      setIsVoting(false);
      resetVoteDialog();
    } finally {
      if (isVoting) {
        setIsVoting(false);
        resetVoteDialog();
      }
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
