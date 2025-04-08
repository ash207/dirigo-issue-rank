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

  // Step 2: Check participation status
  if (hasGhostVoted) {
    return {
      shouldShowPrivacyDialog: false,
      isValidRequest: false,
      voteAction: "invalid",
      errorMessage: "You've already participated in voting on this issue and cannot cast another vote"
    };
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
  
  // Step 5: Check for any additional validation
  if (userId && issueId) {
    // With the new system, we've simplified validation since participation tracking
    // is handled separately from vote tracking
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
