
import { VoteActionType } from "../types/voteActionTypes";

/**
 * Determine what kind of vote action is required
 */
export const determineVoteActionType = (
  voteAction: VoteActionType
): "remove" | "ghost" | "public" | "change" | "invalid" => {
  if (!voteAction || typeof voteAction !== 'string') {
    return "invalid";
  }
  
  switch (voteAction) {
    case "remove":
    case "ghost":
    case "public":
    case "change":
      return voteAction;
    default:
      return "invalid";
  }
};
