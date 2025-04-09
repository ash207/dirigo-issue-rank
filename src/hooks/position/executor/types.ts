
import { VotePrivacyLevel } from "@/components/positions/dialogs/VotePrivacyDialog";
import { VoteActionType, VoteActionParams } from "../types/voteActionTypes";

export type VoteExecutionParams = {
  voteAction: VoteActionType;
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
