import { useState } from "react";
import { ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import VotePrivacyDialog, { VotePrivacyLevel } from "./dialogs/VotePrivacyDialog";

interface PositionVoteButtonProps {
  votes: number;
  userVoted: boolean;
  onVote: (privacyLevel?: VotePrivacyLevel) => void;
  isActiveUser?: boolean;
  isAuthenticated: boolean;
  positionTitle?: string;
}

const PositionVoteButton = ({ 
  votes, 
  userVoted, 
  onVote, 
  isActiveUser = true,
  isAuthenticated,
  positionTitle = "this position"
}: PositionVoteButtonProps) => {
  const [showPrivacyDialog, setShowPrivacyDialog] = useState(false);
  
  let buttonTooltip = "";
  
  if (!isAuthenticated) {
    buttonTooltip = "Sign in to vote";
  } else if (!isActiveUser) {
    buttonTooltip = "Your account needs to be verified to vote";
  } else if (userVoted) {
    buttonTooltip = "Click to remove your vote";
  } else {
    buttonTooltip = "Click to vote for this position";
  }

  const handleVoteClick = () => {
    // If user is removing their vote, no need to show privacy dialog
    if (userVoted) {
      onVote();
      return;
    }
    
    // If user is not authenticated or not active, just call onVote which will handle showing appropriate error
    if (!isAuthenticated || !isActiveUser) {
      onVote();
      return;
    }
    
    // Otherwise, show the privacy dialog
    setShowPrivacyDialog(true);
  };

  const handlePrivacyConfirm = (privacyLevel: VotePrivacyLevel) => {
    onVote(privacyLevel);
  };

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className={`flex items-center gap-1 ${userVoted ? 'text-primary' : ''}`}
              onClick={handleVoteClick}
            >
              {userVoted ? (
                <ThumbsUp className="h-4 w-4 fill-primary" />
              ) : (
                <ThumbsUp className="h-4 w-4" />
              )}
              <span>{votes}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{buttonTooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Vote Privacy Dialog */}
      <VotePrivacyDialog
        open={showPrivacyDialog}
        onOpenChange={setShowPrivacyDialog}
        onConfirm={handlePrivacyConfirm}
        positionTitle={positionTitle}
      />
    </>
  );
};

export default PositionVoteButton;
