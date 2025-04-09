
import { handleChangeVote } from "../actions/handleChangeVote";
import { VoteActionParams } from "../types/voteActionTypes";

/**
 * Execute a change vote action
 */
export const executeChangeVote = async (params: VoteActionParams): Promise<boolean> => {
  const {
    positionId,
    userId,
    userVotedPosition,
    setPositionVotes
  } = params;
  
  console.log("Executing change vote action:", { positionId, userId, userVotedPosition });
  
  return await handleChangeVote(params);
};
