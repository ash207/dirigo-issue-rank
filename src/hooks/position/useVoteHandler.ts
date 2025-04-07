
import { toast } from "sonner";
import { isValidUUID } from "./useVoteValidation";
import { VotePrivacyLevel } from "@/components/positions/dialogs/VotePrivacyDialog";
import { handleMockVote } from "./useVoteMockHandler";
import { handleDatabaseVote } from "./useDbVoteHandler";

export const useVoteHandler = (
  issueId: string | undefined, 
  userId: string | undefined, 
  isAuthenticated: boolean, 
  userVotedPosition: string | null,
  setUserVotedPosition: (positionId: string | null) => void,
  positionVotes: Record<string, number>,
  setPositionVotes: (votes: Record<string, number>) => void,
  isActiveUser: boolean = false
) => {
  const updatePositionVote = (positionId: string, newCount: number) => {
    setPositionVotes({
      ...positionVotes,
      [positionId]: newCount
    });
  };

  const handleVote = async (positionId: string, privacyLevel?: VotePrivacyLevel) => {
    // Validate auth state
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
      return handleMockVote(
        issueId,
        positionId,
        userId,
        userVotedPosition,
        positionVotes,
        updatePositionVote,
        setUserVotedPosition,
        privacyLevel
      );
    }
    
    // For real data, handle database operations
    return handleDatabaseVote(
      issueId,
      positionId,
      userId,
      userVotedPosition,
      positionVotes,
      updatePositionVote,
      setUserVotedPosition,
      privacyLevel
    );
  };

  return {
    handleVote
  };
};
