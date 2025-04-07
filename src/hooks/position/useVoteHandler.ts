
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
    if (hasGhostVoted && ghostVotedPositionId !== positionId) {
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
      
      // Double-check for existing ghost votes to prevent race conditions
      if (privacyLevel === 'ghost' && !isRemovingVote) {
        try {
          // Verify no existing ghost vote directly from the database
          const voteStatus = await checkVoteTracking(validUserId, validIssueId);
          
          // If there's already a ghost vote for this issue, prevent the vote
          if (voteStatus.exists) {
            toast.error("You've already cast a ghost vote on this issue and cannot cast another");
            setIsVoting(false);
            resetVoteDialog();
            return;
          }
        } catch (error) {
          console.error("Error checking ghost vote status:", error);
          toast.error("Unable to verify your voting status. Please try again.");
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
          // For ghost votes, we need to coordinate two operations:
          // 1. Increment the anonymous vote count
          // 2. Track that this user has cast a ghost vote
          
          try {
            // First try to track the ghost vote
            await trackGhostVote(validUserId, validIssueId, positionId);
            
            // Only if tracking succeeds, increment the vote count
            await castGhostVote(positionId);
            
            // Update local state only if both operations succeeded
            setPositionVotes(prev => ({
              ...prev,
              [positionId]: (prev[positionId] || 0) + 1
            }));
            
            toast.success("Ghost vote recorded");
          } catch (error) {
            console.error("Ghost vote failed:", error);
            toast.error(error instanceof Error ? error.message : "Failed to record your ghost vote");
            setIsVoting(false);
            resetVoteDialog();
            return;
          }
        } else {
          // For public votes, create a vote record
          await castPublicVote(positionId, validUserId, privacyLevel, validIssueId);
          
          // If there was a ghost vote tracking record, remove it
          if (hasGhostVoted) {
            try {
              await deleteVoteTracking(validUserId, validIssueId);
            } catch (error) {
              console.error("Failed to remove ghost vote tracking:", error);
              // Continue anyway since the public vote succeeded
            }
          }
          
          // Update local state
          setUserVotedPosition(positionId);
          setPositionVotes(prev => ({
            ...prev,
            [positionId]: (prev[positionId] || 0) + 1
          }));
          
          toast.success("Vote recorded");
        }
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
