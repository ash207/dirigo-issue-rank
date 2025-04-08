
import { VotePrivacyLevel } from "@/components/positions/dialogs/VotePrivacyDialog";
import { toast } from "sonner";
import { validateVoteParams, validateGhostVoteState } from "./useVoteValidation";

/**
 * Processes vote requests, runs validations, and determines the appropriate action
 */
export const processVoteRequest = async (
  userId: string | undefined,
  issueId: string | undefined,
  positionId: string,
  privacyLevel: VotePrivacyLevel | undefined,
  isAuthenticated: boolean,
  isActiveUser: boolean,
  userVotedPosition: string | null,
  hasGhostVoted: boolean,
  ghostVotedPositionId: string | null
): Promise<{
  shouldShowPrivacyDialog: boolean,
  isValidRequest: boolean,
  voteAction: "remove" | "ghost" | "public" | "change" | "invalid",
  errorMessage?: string
}> => {
  // Debug log for vote processing
  console.log("Processing vote request:", { 
    positionId, 
    privacyLevel, 
    isAuthenticated, 
    userVotedPosition,
    hasGhostVoted,
    ghostVotedPositionId 
  });
  
  // Step 1: Validate vote parameters
  const validation = validateVoteParams(userId, issueId, isAuthenticated, isActiveUser);
  if (!validation.isValid) {
    return {
      shouldShowPrivacyDialog: false,
      isValidRequest: false,
      voteAction: "invalid",
      errorMessage: validation.errorMessage
    };
  }

  // Step 2: Check ghost vote status
  if (hasGhostVoted) {
    // Special case: Admin removing a ghost vote on the ghost-voted position
    if (ghostVotedPositionId === positionId && userVotedPosition === positionId) {
      console.log("Admin removing ghost vote, allowing operation");
    } else {
      return {
        shouldShowPrivacyDialog: false,
        isValidRequest: false,
        voteAction: "invalid",
        errorMessage: "You've already cast a ghost vote on this issue and cannot cast another vote or change it"
      };
    }
  }
  
  // Step 3: Is the user removing a vote?
  const isRemovingVote = userVotedPosition === positionId;
  
  // Step 4: Does the user need to choose a privacy level?
  if (!isRemovingVote && !privacyLevel) {
    return {
      shouldShowPrivacyDialog: true,
      isValidRequest: true,
      voteAction: "invalid" // Temporary until privacy level is selected
    };
  }
  
  // Step 5: Check for any additional ghost vote validation to prevent race conditions
  if (userId && issueId) {
    const ghostValidation = await validateGhostVoteState(
      userId, 
      issueId, 
      hasGhostVoted, 
      ghostVotedPositionId, 
      positionId, 
      isRemovingVote
    );
    
    if (!ghostValidation.isValid) {
      return {
        shouldShowPrivacyDialog: false,
        isValidRequest: false,
        voteAction: "invalid",
        errorMessage: ghostValidation.errorMessage
      };
    }
  }
  
  // Step 6: Determine vote action type
  if (isRemovingVote) {
    return {
      shouldShowPrivacyDialog: false,
      isValidRequest: true,
      voteAction: "remove"
    };
  }
  
  // Step 7: Check if user already voted on a different position
  if (userVotedPosition && userVotedPosition !== positionId) {
    return {
      shouldShowPrivacyDialog: false,
      isValidRequest: true,
      voteAction: "change"
    };
  }
  
  // Step 8: Determine new vote type based on privacy level
  if (privacyLevel === "ghost") {
    return {
      shouldShowPrivacyDialog: false,
      isValidRequest: true,
      voteAction: "ghost"
    };
  } else {
    return {
      shouldShowPrivacyDialog: false,
      isValidRequest: true,
      voteAction: "public"
    };
  }
};
