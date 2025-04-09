
import { VotePrivacyLevel } from "@/components/positions/dialogs/VotePrivacyDialog";

/**
 * Common parameters for all vote action handlers
 */
export type VoteActionParams = {
  positionId: string;
  userId: string;
  issueId: string;
  userVotedPosition: string | null;
  setUserVotedPosition: (positionId: string | null) => void;
  positionVotes: Record<string, number>;
  setPositionVotes: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  setIsVoting: (isVoting: boolean) => void;
  resetVoteDialog: () => void;
  refreshVotes?: () => void;
  hasGhostVoted: boolean;
  ghostVotedPositionId: string | null;
  privacyLevel?: VotePrivacyLevel;
};

/**
 * Types of vote actions that can be performed
 */
export type VoteActionType = "remove" | "ghost" | "public" | "change" | "invalid";
