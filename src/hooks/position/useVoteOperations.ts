
import { isValidUUID } from "./useVoteValidation";
import { VotePrivacyLevel } from "@/components/positions/dialogs/VotePrivacyDialog";
import { handleMockVote } from "./useMockVoteOperations";
import { handleUnvote } from "./useVoteRemovalOperations";
import { handleChangeVote } from "./useVoteChangeOperations";
import { handleNewVote } from "./useNewVoteOperations";
import { updatePositionVote } from "./useVoteUtils";

// Re-export the utility functions for other modules to use
export { 
  updatePositionVote,
  handleMockVote, 
  handleUnvote, 
  handleChangeVote, 
  handleNewVote 
};
