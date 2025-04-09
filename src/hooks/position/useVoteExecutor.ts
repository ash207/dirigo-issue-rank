
import { toast } from "sonner";
import { VoteActionParams } from "./types/voteActionTypes";
import { executeVoteAction as executeAction } from "./executor/voteActionExecutor";
import { VoteExecutionParams } from "./executor/types";

/**
 * Executes the appropriate vote action based on the determined vote type
 * This is a streamlined version that delegates to specialized executors
 */
export const executeVoteAction = async ({
  voteAction,
  positionId,
  userId,
  issueId,
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
}: VoteExecutionParams): Promise<boolean> => {
  console.log("Vote executor initiated:", { 
    voteAction, 
    positionId, 
    privacyLevel 
  });
  
  // Create vote action parameters
  const actionParams: VoteActionParams = {
    positionId,
    userId,
    issueId,
    userVotedPosition,
    setUserVotedPosition,
    positionVotes,
    setPositionVotes,
    setIsVoting,
    resetVoteDialog,
    refreshVotes,
    hasGhostVoted,
    ghostVotedPositionId,
    privacyLevel
  };
  
  try {
    return await executeAction(voteAction, actionParams);
  } catch (error: any) {
    console.error("Error executing vote action:", error);
    toast.error(error.message || "Failed to process your vote");
    setIsVoting(false);
    resetVoteDialog();
    return false;
  }
};
