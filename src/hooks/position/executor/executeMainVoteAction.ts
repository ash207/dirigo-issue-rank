
import { VoteActionType, VoteActionParams } from "../types/voteActionTypes";
import { handleRemoveVote } from "../actions/handleRemoveVote";
import { handleGhostVote } from "../actions/handleGhostVote";
import { handlePublicVote } from "../actions/handlePublicVote";

/**
 * Execute the main vote action based on vote type
 */
export const executeMainVoteAction = async (
  voteAction: VoteActionType,
  params: VoteActionParams
): Promise<boolean> => {
  console.log(`Executing ${voteAction} vote action`);
  
  switch (voteAction) {
    case "remove":
      return await handleRemoveVote(params);
      
    case "ghost":
      return await handleGhostVote(params);
      
    case "public":
      return await handlePublicVote(params);
      
    case "invalid":
    default:
      console.error("Invalid vote action");
      return false;
  }
};
