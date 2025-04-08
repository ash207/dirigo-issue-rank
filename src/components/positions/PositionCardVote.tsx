
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
  
  // Check if this position is the one the user cast a ghost vote on
  const isGhostVotedPosition = ghostVotedPositionId === id;

  const handleVoteClick = () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to vote");
      return;
    }
    
    if (!isActiveUser) {
      toast.error("Your account needs to be active to vote");
      return;
    }
    
    // If this isn't the ghost-voted position and there is a ghost vote active, block the vote
    if (hasGhostVoted && !isGhostVotedPosition && !isVoted) {
      toast.error("You've already cast a ghost vote on this issue and cannot vote on other positions");
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
    
    // If this isn't the ghost-voted position and there is a ghost vote active, block the vote
    if (hasGhostVoted && !isGhostVotedPosition && !isVoted) {
      toast.error("You've already cast a ghost vote on this issue and cannot vote on other positions");
      return;
    }
    
    setIsVotePrivacyDialogOpen(true);
  };

  const handlePrivacySelected = (privacyLevel: VotePrivacyLevel) => {
    // Additional safeguard to prevent ghost votes if user already has a ghost vote
    if (privacyLevel === 'ghost' && hasGhostVoted && !isGhostVotedPosition) {
      toast.error("You've already cast a ghost vote on this issue and cannot vote on other positions");
      return;
    }
    
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
        disabled={isVoting || (isOwner && !isVoted) || (hasGhostVoted && !isGhostVotedPosition && !isVoted)}
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
