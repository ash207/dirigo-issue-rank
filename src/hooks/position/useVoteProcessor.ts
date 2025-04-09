
import { VotePrivacyLevel } from "@/components/positions/dialogs/VotePrivacyDialog";
import { toast } from "sonner";
import { validateVoteParams, validateGhostVoteState } from "./useVoteValidation";
import { checkIssueParticipation } from "./useGhostVoteServices";
import { VoteActionType } from "./types/voteActionTypes";

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
  voteAction: VoteActionType,
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
  // If user has a ghost vote, they can't vote again
  if (hasGhostVoted && privacyLevel !== "ghost") {
    return {
      shouldShowPrivacyDialog: false,
      isValidRequest: false,
      voteAction: "invalid",
      errorMessage: "You've already participated in voting on this issue and cannot cast another vote"
    };
  }
  
  // If we have a valid user ID and issue ID, check if the user already has a ghost vote
  if (userId && issueId && privacyLevel === "ghost") {
    // Check if the user already has a public vote on this issue before allowing a ghost vote
    const hasPublicVote = !!userVotedPosition;
    
    if (hasPublicVote) {
      // Allow switching from public to ghost vote - this will be handled in handleGhostVote
      console.log("User is switching from public to ghost vote");
    }
  }
  
  // Step 3: Is the user removing a vote?
  const isRemovingVote = userVotedPosition === positionId;
  
  // Step 4: Does the user need to choose a privacy level?
  // For new votes or switching to a different position
  const isNewVote = !userVotedPosition; 
  const isSwitchingVote = userVotedPosition && userVotedPosition !== positionId;
  
  if ((isNewVote || isSwitchingVote) && !privacyLevel) {
    return {
      shouldShowPrivacyDialog: true,
      isValidRequest: true,
      voteAction: "invalid" // Temporary until privacy level is selected
    };
  }
  
  // Step 5: Determine vote action type
  if (isRemovingVote) {
    return {
      shouldShowPrivacyDialog: false,
      isValidRequest: true,
      voteAction: "remove"
    };
  }
  
  // Step 6: If user already voted on a different position, we want a direct switch
  // This is handled in the handlePublicVote logic now, no need for "change" action
  
  // Step 7: Determine new vote type based on privacy level
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
