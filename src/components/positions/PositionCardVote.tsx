
import { useState } from "react";
import { toast } from "sonner";
import PositionVoteButton from "./PositionVoteButton";
import VotePrivacyDialog, { VotePrivacyLevel } from "./dialogs/VotePrivacyDialog";

interface PositionCardVoteProps {
  id: string;
  title: string;
  isAuthenticated: boolean;
  isActiveUser?: boolean;
  isOwner: boolean;
  voteCount?: number;
  isVoted?: boolean;
  onVote?: (positionId: string, privacyLevel?: VotePrivacyLevel) => void;
  isVoting?: boolean;
  hasGhostVoted?: boolean;
  ghostVotedPositionId?: string | null;
}

const PositionCardVote = ({
  id,
  title,
  isAuthenticated,
  isActiveUser = true,
  isOwner,
  voteCount = 0,
  isVoted = false,
  onVote,
  isVoting = false,
  hasGhostVoted = false,
  ghostVotedPositionId = null
}: PositionCardVoteProps) => {
  const [isVotePrivacyDialogOpen, setIsVotePrivacyDialogOpen] = useState(false);

  const handleVoteClick = () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to vote");
      return;
    }
    
    if (!isActiveUser) {
      toast.error("Your account needs to be active to vote");
      return;
    }
    
    // If there's already a ghost vote on this issue and the user isn't trying to remove it,
    // display a message (but we'll allow switching from public vote to ghost vote)
    if (hasGhostVoted && !isVoted) {
      toast.error("You've already cast a ghost vote on this issue and cannot cast another vote or change it");
      return;
    }
    
    if (onVote) {
      if (isVoted) {
        onVote(id);
      } else {
        setIsVotePrivacyDialogOpen(true);
      }
    }
  };

  const handleUpArrowClick = () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to view voting options");
      return;
    }
    
    // If there's already a ghost vote on this issue, display a message
    // (but we'll allow switching from public vote to ghost vote in the privacy dialog)
    if (hasGhostVoted && !isVoted) {
      toast.error("You've already cast a ghost vote on this issue and cannot cast another vote or change it");
      return;
    }
    
    setIsVotePrivacyDialogOpen(true);
  };

  const handlePrivacySelected = (privacyLevel: VotePrivacyLevel) => {
    if (onVote) {
      onVote(id, privacyLevel);
    }
    setIsVotePrivacyDialogOpen(false);
  };

  return (
    <>
      <PositionVoteButton
        voteCount={voteCount}
        isVoted={isVoted}
        onClick={handleVoteClick}
        onUpClick={handleUpArrowClick}
        disabled={isVoting || (isOwner && !isVoted) || (hasGhostVoted && !isVoted)}
        positionTitle={title}
        isActiveUser={isActiveUser}
        isAuthenticated={isAuthenticated}
      />
      
      <VotePrivacyDialog
        open={isVotePrivacyDialogOpen}
        onOpenChange={setIsVotePrivacyDialogOpen}
        onPrivacySelected={handlePrivacySelected}
        positionTitle={title}
      />
    </>
  );
};

export default PositionCardVote;
