
// Consolidated exports file for all vote actions
import { VoteActionParams, VoteActionType } from "./types/voteActionTypes";
import { handleRemoveVote } from "./actions/handleRemoveVote";
import { handleGhostVote } from "./actions/handleGhostVote"; 
import { handlePublicVote } from "./actions/handlePublicVote";
import { handleChangeVote } from "./actions/handleChangeVote";

// Re-export all action handlers
export {
  handleRemoveVote,
  handleGhostVote,
  handlePublicVote,
  handleChangeVote
};

// Re-export the types
export type { VoteActionParams, VoteActionType };
