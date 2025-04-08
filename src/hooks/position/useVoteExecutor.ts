
import { toast } from "sonner";
import { VotePrivacyLevel } from "@/components/positions/dialogs/VotePrivacyDialog";
import { handleRemoveVote, handleGhostVote, handlePublicVote, handleChangeVote } from "./useVoteActions";

type VoteExecutionParams = {
  voteAction: "remove" | "ghost" | "public" | "change" | "invalid";
  positionId: string;
  userId: string;
  issueId: string;
  privacyLevel?: VotePrivacyLevel;
  userVotedPosition: string | null;
  setUserVotedPosition: (positionId: string | null) => void;
  positionVotes: Record<string, number>;
  setPositionVotes: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  hasGhostVoted: boolean;
  ghostVotedPositionId: string | null;
  setIsVoting: (isVoting: boolean) => void;
  resetVoteDialog: () => void;
  refreshVotes?: () => void;
};

/**
 * Executes the appropriate vote action based on the determined vote type
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
  console.log("Executing vote action:", { 
    voteAction, 
    positionId, 
    privacyLevel 
  });
  
  let actionSuccess = false;
  
  try {
    // Handle changing votes if needed
    if (voteAction === "change") {
      const changeSuccess = await handleChangeVote({
        positionId,
        userId,
        issueId,
        userVotedPosition,
        setUserVotedPosition,
        positionVotes,
        setPositionVotes,
        setIsVoting,
        resetVoteDialog,
        hasGhostVoted,
        ghostVotedPositionId
      });
      
      if (!changeSuccess) {
        return false;
      }
    }
    
    // Execute the main vote action
    switch (voteAction) {
      case "remove":
        actionSuccess = await handleRemoveVote({
          positionId,
          userId,
          issueId,
          userVotedPosition,
          setUserVotedPosition,
          positionVotes,
          setPositionVotes,
          setIsVoting,
          resetVoteDialog,
          hasGhostVoted,
          ghostVotedPositionId
        });
        break;
        
      case "ghost":
        actionSuccess = await handleGhostVote({
          positionId,
          userId,
          issueId,
          userVotedPosition,
          setUserVotedPosition,
          positionVotes,
          setPositionVotes,
          setIsVoting,
          resetVoteDialog,
          hasGhostVoted,
          ghostVotedPositionId
        });
        break;
        
      case "public":
        actionSuccess = await handlePublicVote({
          positionId,
          userId,
          issueId,
          userVotedPosition,
          setUserVotedPosition,
          positionVotes,
          setPositionVotes,
          setIsVoting,
          resetVoteDialog,
          hasGhostVoted,
          ghostVotedPositionId,
          privacyLevel
        });
        break;
        
      case "invalid":
      default:
        console.error("Invalid vote action");
        actionSuccess = false;
        break;
    }
    
    // Refresh votes if callback provided and action succeeded
    if (refreshVotes && actionSuccess) {
      refreshVotes();
    }
    
    return actionSuccess;
  } catch (error: any) {
    console.error("Error executing vote action:", error);
    toast.error(error.message || "Failed to process your vote");
    return false;
  }
};
