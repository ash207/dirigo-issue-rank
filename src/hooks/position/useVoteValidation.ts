
// Validation utilities for the voting process
import { toast } from "sonner";
import { VotePrivacyLevel } from "@/components/positions/dialogs/VotePrivacyDialog";
import { checkVoteTracking } from "./useVoteServices";

// Helper to check if a string is a valid UUID
export const isValidUUID = (str: string | undefined): boolean => {
  if (!str) return false;
  // Basic UUID format validation (simplified)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

// Validate vote parameters
export const validateVoteParams = (
  userId: string | undefined,
  issueId: string | undefined,
  isAuthenticated: boolean,
  isActiveUser: boolean
): { isValid: boolean; errorMessage?: string } => {
  if (!isAuthenticated) {
    return { isValid: false, errorMessage: "Please sign in to vote on positions" };
  }

  if (!isActiveUser) {
    return { isValid: false, errorMessage: "Your account needs to be active to vote" };
  }

  if (!userId) {
    return { isValid: false, errorMessage: "Unable to process vote: User ID is missing" };
  }
  
  if (!issueId) {
    return { isValid: false, errorMessage: "Unable to process vote: Issue ID is missing" };
  }

  return { isValid: true };
};

// Validate ghost vote state
export const validateGhostVoteState = async (
  userId: string,
  issueId: string,
  hasGhostVoted: boolean,
  ghostVotedPositionId: string | null,
  targetPositionId: string,
  isVoted: boolean = false
): Promise<{ isValid: boolean; errorMessage?: string }> => {
  // If not the ghost-voted position and there is a ghost vote active, block the vote
  if (hasGhostVoted && ghostVotedPositionId !== targetPositionId && !isVoted) {
    return {
      isValid: false,
      errorMessage: "You've already cast a ghost vote on this issue and cannot vote on other positions"
    };
  }
  
  // Double-check for ghost votes (critical to prevent race conditions)
  try {
    const voteStatus = await checkVoteTracking(userId, issueId);
    
    // If there's a ghost vote but not on this position and we're not already voted, block it
    if (voteStatus.exists && voteStatus.position_id !== targetPositionId && !isVoted) {
      return {
        isValid: false,
        errorMessage: "You've already cast a ghost vote on this issue and cannot vote on other positions"
      };
    }
    
    return { isValid: true };
  } catch (error) {
    console.error("Error checking ghost vote status:", error);
    return {
      isValid: false,
      errorMessage: "Unable to verify your voting status. Please try again."
    };
  }
};

// Determine vote type 
export const determineVoteAction = (
  isVoted: boolean,
  privacyLevel?: VotePrivacyLevel
): "remove" | "ghost" | "public" | "need-privacy" => {
  if (isVoted) {
    return "remove";
  }
  
  if (!privacyLevel) {
    return "need-privacy";
  }
  
  return privacyLevel === "ghost" ? "ghost" : "public";
};
