
// New file to handle vote-related actions separately from the main hook
import { toast } from "sonner";
import { VotePrivacyLevel } from "@/components/positions/dialogs/VotePrivacyDialog";
import {
  removeVote,
  switchVote,
  castPublicVote
} from "./useVoteServices";
import { castGhostVote } from "./useGhostVoteServices";

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
    // Cast a truly anonymous vote using the Edge Function
    await castGhostVote(
      positionId, 
      issueId, // Now we pass issueId for participation tracking
      userId   // Now we pass userId for participation tracking
    );
    
    // Update local state
    setPositionVotes(prev => ({
      ...prev,
      [positionId]: (prev[positionId] || 0) + 1
    }));
    
    toast.success("Anonymous vote recorded");
    return true;
  } catch (error) {
    console.error("Ghost vote failed:", error);
    toast.error(error instanceof Error ? error.message : "Failed to record your anonymous vote");
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
  userVotedPosition,
  setIsVoting,
  resetVoteDialog
}: VoteActionParams) => {
  if (!privacyLevel) {
    console.error("Missing privacy level for public vote");
    toast.error("Invalid vote configuration");
    setIsVoting(false);
    resetVoteDialog();
    return false;
  }
  
  try {
    // If user already voted for another position, we'll switch the vote
    if (userVotedPosition && userVotedPosition !== positionId) {
      await switchVote(userVotedPosition, positionId, userId, privacyLevel, issueId);
      
      // Update local state for both positions
      setPositionVotes(prev => ({
        ...prev,
        [userVotedPosition]: Math.max(0, (prev[userVotedPosition] || 0) - 1),
        [positionId]: (prev[positionId] || 0) + 1
      }));
      
      toast.success("Your vote has been switched");
    } else {
      // For new public votes, create a vote record
      await castPublicVote(positionId, userId, privacyLevel, issueId);
      
      // Update local state
      setPositionVotes(prev => ({
        ...prev,
        [positionId]: (prev[positionId] || 0) + 1
      }));
      
      toast.success("Vote recorded");
    }
    
    // Update which position the user voted for
    setUserVotedPosition(positionId);
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
 * This function is now only used for ghost votes or special cases
 * Most vote switching is handled directly in handlePublicVote
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
