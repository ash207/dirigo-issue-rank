
import { ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface PositionVoteButtonProps {
  votes: number;
  userVoted: boolean;
  onVote: () => void;
  isActiveUser?: boolean;
  isAuthenticated: boolean;
}

const PositionVoteButton = ({ 
  votes, 
  userVoted, 
  onVote, 
  isActiveUser = true,
  isAuthenticated
}: PositionVoteButtonProps) => {
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

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className={`flex items-center gap-1 ${userVoted ? 'text-primary' : ''}`}
            onClick={onVote}
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
  );
};

export default PositionVoteButton;
