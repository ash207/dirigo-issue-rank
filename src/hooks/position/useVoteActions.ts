
// New file to handle vote-related actions separately from the main hook
import { toast } from "sonner";
import { VotePrivacyLevel } from "@/components/positions/dialogs/VotePrivacyDialog";
import {
  checkVoteTracking,
  trackGhostVote,
  deleteVoteTracking,
  castGhostVote,
  castPublicVote,
  removeVote
} from "./useVoteServices";

type VoteActionParams = {
  positionId: string;
  userId: string;
  issueId: string;
  userVotedPosition: string | null;
  setUserVotedPosition: (positionId: string | null) => void;
  positionVotes: Record<string, number>;
  setPositionVotes: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  setIsVoting: (isVoting: boolean) => void;
  resetVoteDialog: () => void;
  refreshVotes?: () => void;
  hasGhostVoted: boolean;
  ghostVotedPositionId: string | null;
  privacyLevel?: VotePrivacyLevel;
};

/**
 * Handle removing an existing vote
 */
export const handleRemoveVote = async ({
  positionId,
  userId,
  setUserVotedPosition,
  setPositionVotes,
  setIsVoting,
  resetVoteDialog
}: VoteActionParams) => {
  try {
    await removeVote(positionId, userId);
    
    // Update local state
    setUserVotedPosition(null);
    setPositionVotes(prev => ({
      ...prev,
      [positionId]: Math.max(0, (prev[positionId] || 0) - 1)
    }));
    
    toast.success("Vote removed");
    return true;
  } catch (error) {
    console.error("Error removing vote:", error);
    toast.error(error instanceof Error ? error.message : "Failed to remove your vote");
    return false;
  } finally {
    setIsVoting(false);
    resetVoteDialog();
  }
};

/**
 * Handle casting a ghost vote
 */
export const handleGhostVote = async ({
  positionId,
  userId,
  issueId,
  setPositionVotes,
  setIsVoting,
  resetVoteDialog
}: VoteActionParams) => {
  try {
    // First try to track the ghost vote
    await trackGhostVote(userId, issueId, positionId);
    
    // Only if tracking succeeds, increment the vote count
    await castGhostVote(positionId);
    
    // Update local state only if both operations succeeded
    setPositionVotes(prev => ({
      ...prev,
      [positionId]: (prev[positionId] || 0) + 1
    }));
    
    toast.success("Ghost vote recorded");
    return true;
  } catch (error) {
    console.error("Ghost vote failed:", error);
    toast.error(error instanceof Error ? error.message : "Failed to record your ghost vote");
    return false;
  } finally {
    setIsVoting(false);
    resetVoteDialog();
  }
};

/**
 * Handle casting a public vote
 */
export const handlePublicVote = async ({
  positionId,
  userId,
  issueId,
  setUserVotedPosition,
  setPositionVotes,
  privacyLevel,
  setIsVoting,
  resetVoteDialog,
  hasGhostVoted,
  ghostVotedPositionId
}: VoteActionParams) => {
  if (!privacyLevel) {
    console.error("Missing privacy level for public vote");
    toast.error("Invalid vote configuration");
    setIsVoting(false);
    resetVoteDialog();
    return false;
  }
  
  try {
    // For public votes, create a vote record
    await castPublicVote(positionId, userId, privacyLevel, issueId);
    
    // If there was a ghost vote tracking record and it matches this position, remove it
    if (hasGhostVoted && ghostVotedPositionId === positionId) {
      try {
        await deleteVoteTracking(userId, issueId);
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
    return true;
  } catch (error) {
    console.error("Public vote failed:", error);
    toast.error(error instanceof Error ? error.message : "Failed to record your vote");
    return false;
  } finally {
    setIsVoting(false);
    resetVoteDialog();
  }
};

/**
 * Handle removing a vote from one position and casting to another
 */
export const handleChangeVote = async ({
  positionId,
  userId,
  userVotedPosition,
  setPositionVotes
}: VoteActionParams) => {
  if (!userVotedPosition || userVotedPosition === positionId) {
    return true; // Nothing to change
  }
  
  try {
    await removeVote(userVotedPosition, userId);
    
    // Update local state for previous vote
    setPositionVotes(prev => ({
      ...prev,
      [userVotedPosition]: Math.max(0, (prev[userVotedPosition] || 0) - 1)
    }));
    
    return true;
  } catch (error) {
    console.error("Error changing vote:", error);
    toast.error("Failed to change your vote");
    return false;
  }
};
