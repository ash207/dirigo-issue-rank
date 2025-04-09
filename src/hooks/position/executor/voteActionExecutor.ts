
import { toast } from "sonner";
import { VoteActionType, VoteActionParams } from "../types/voteActionTypes";
import { executeChangeVote } from "./executeChangeVote";
import { executeMainVoteAction } from "./executeMainVoteAction";

/**
 * Coordinates the execution of vote actions
 */
export const executeVoteAction = async (
  voteAction: VoteActionType,
  params: VoteActionParams
): Promise<boolean> => {
  try {
    console.log("Executing vote action:", {
      voteAction,
      positionId: params.positionId
    });
    
    let actionSuccess = false;
    
    // Handle changing votes if needed
    if (voteAction === "change") {
      const changeSuccess = await executeChangeVote(params);
      
      if (!changeSuccess) {
        return false;
      }
    }
    
    // Execute the main vote action
    actionSuccess = await executeMainVoteAction(voteAction, params);
    
    // Refresh votes if callback provided and action succeeded
    if (params.refreshVotes && actionSuccess) {
      params.refreshVotes();
    }
    
    return actionSuccess;
  } catch (error: any) {
    console.error("Error executing vote action:", error);
    toast.error(error.message || "Failed to process your vote");
    return false;
  }
};
