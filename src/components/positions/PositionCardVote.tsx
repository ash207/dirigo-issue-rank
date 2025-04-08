
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
  isVoting = false
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
        disabled={isVoting || (isOwner && !isVoted)}
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
