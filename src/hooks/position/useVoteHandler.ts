
import { toast } from "sonner";
import { isValidUUID } from "./useVoteValidation";
import { VotePrivacyLevel } from "@/components/positions/dialogs/VotePrivacyDialog";
import { 
  handleMockVote, 
  handleUnvote, 
  handleChangeVote, 
  handleNewVote 
} from "./useVoteOperations";

export const useVoteHandler = (
  issueId: string | undefined, 
  userId: string | undefined, 
  isAuthenticated: boolean, 
  userVotedPosition: string | null,
  setUserVotedPosition: (positionId: string | null) => void,
  positionVotes: Record<string, number>,
  setPositionVotes: React.Dispatch<React.SetStateAction<Record<string, number>>>,
  isActiveUser: boolean = false
) => {
  const handleVote = async (positionId: string, privacyLevel?: VotePrivacyLevel) => {
    if (!isAuthenticated || !userId || !issueId) {
      toast.error("You must be signed in to vote");
      return;
    }
    
    if (!isActiveUser) {
      toast.error("Your account needs to be verified to vote. Please check your email.");
      return;
    }
    
    // For mock data with non-UUID IDs, simulate voting without database calls
    if (!isValidUUID(issueId) || !isValidUUID(positionId)) {
      console.log("Using mock voting for non-UUID IDs", { issueId, positionId, privacyLevel });
      handleMockVote(
        userVotedPosition, 
        positionId, 
        positionVotes, 
        setUserVotedPosition, 
        setPositionVotes
      );
      return;
    }
    
    try {
      if (userVotedPosition) {
        if (userVotedPosition === positionId) {
          // User is trying to unvote
          await handleUnvote(
            userVotedPosition, 
            userId, 
            issueId, 
            privacyLevel, 
            setPositionVotes
          );
          setUserVotedPosition(null);
        } else {
          // User is changing their vote
          await handleChangeVote(
            userVotedPosition, 
            positionId, 
            userId, 
            issueId, 
            privacyLevel, 
            setPositionVotes
          );
          setUserVotedPosition(positionId);
        }
      } else {
        // User is voting for the first time
        await handleNewVote(
          positionId, 
          userId, 
          issueId, 
          privacyLevel, 
          setPositionVotes
        );
        setUserVotedPosition(positionId);
      }
    } catch (error: any) {
      console.error("Error saving vote:", error);
      toast.error("Failed to save your vote. Please try again.");
    }
  };

  return {
    handleVote
  };
};
