
import { useState } from "react";
import { toast } from "sonner";
import { VotePrivacyLevel } from "@/components/positions/dialogs/VotePrivacyDialog";
import { useVoteDialog } from "./useVoteDialog";
import { useVoteState } from "./useVoteState";
import { validateVoteParams } from "./useVoteValidation";
import {
  checkVoteTracking,
  trackGhostVote,
  deleteVoteTracking,
  castGhostVote,
  castPublicVote,
  removeVote
} from "./useVoteServices";

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

    // If user has already cast a ghost vote on this issue, check if it's for the same position
    // If the ghost vote was for a different position that still exists, they cannot vote
    if (hasGhostVoted && ghostVotedPositionId && ghostVotedPositionId !== positionId) {
      toast.error("You've already cast a ghost vote on this issue and cannot vote on other positions");
      return;
    }

    // If we have a userVotedPosition that equals the positionId, it means we're removing a vote
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
      
      // If user wants to place a ghost vote, we need to check if they already voted on this issue
      if (privacyLevel === 'ghost' && !isRemovingVote) {
        const voteStatus = await checkVoteTracking(validUserId, validIssueId);
        
        // Only prevent the vote if there's an existing ghost vote for a DIFFERENT position
        if (voteStatus.exists && voteStatus.position_id && voteStatus.position_id !== positionId) {
          toast.error("You've already cast a ghost vote on this issue and cannot change it");
          setIsVoting(false);
          resetVoteDialog();
          return;
        }
      }
      
      // If user already voted on a different position, remove that vote first
      if (userVotedPosition && userVotedPosition !== positionId) {
        await removeVote(userVotedPosition, validUserId);
        
        // Update local state for previous vote
        setPositionVotes(prev => ({
          ...prev,
          [userVotedPosition]: Math.max(0, (prev[userVotedPosition] || 0) - 1)
        }));
      }

      // If removing existing vote
      if (isRemovingVote) {
        await removeVote(positionId, validUserId);
        
        // Update local state
        setUserVotedPosition(null);
        setPositionVotes(prev => ({
          ...prev,
          [positionId]: Math.max(0, (prev[positionId] || 0) - 1)
        }));
        
        toast.success("Vote removed");
      } else {
        // Cast a new vote based on privacy level
        if (privacyLevel === 'ghost') {
          // For ghost votes, use a direct INSERT without ON CONFLICT
          await castGhostVote(positionId);
          
          // Record that this user has cast a ghost vote on this issue using our edge function
          await trackGhostVote(validUserId, validIssueId, positionId);
        } else {
          // For public votes, create a vote record
          await castPublicVote(positionId, validUserId, privacyLevel, validIssueId);
          
          // If there was a ghost vote tracking record, remove it
          await deleteVoteTracking(validUserId, validIssueId);
        }

        // Update local state
        setUserVotedPosition(positionId);
        setPositionVotes(prev => ({
          ...prev,
          [positionId]: (prev[positionId] || 0) + 1
        }));

        toast.success("Vote recorded");
      }

      // Refresh votes if callback provided
      if (refreshVotes) {
        refreshVotes();
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
