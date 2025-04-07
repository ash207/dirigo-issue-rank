
import { ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface PositionVoteButtonProps {
  voteCount: number;
  isVoted: boolean;
  onClick: () => void;
  disabled?: boolean;
  positionTitle?: string;
  isActiveUser?: boolean;
  isAuthenticated?: boolean;
}

const PositionVoteButton = ({
  voteCount,
  isVoted,
  onClick,
  disabled = false,
  positionTitle = "this position",
  isActiveUser = true,
  isAuthenticated = false
}: PositionVoteButtonProps) => {
  let tooltipText = isVoted 
    ? `Unvote ${positionTitle}` 
    : `Vote for ${positionTitle}`;
    
  if (!isAuthenticated) {
    tooltipText = "Sign in to vote";
  } else if (!isActiveUser) {
    tooltipText = "Account needs to be active to vote";
  } else if (disabled && !isVoted) {
    tooltipText = "You cannot vote on your own position";
  }

  // Add console log for debugging
  console.log("Vote button state:", { 
    isVoted, 
    disabled, 
    tooltipText, 
    isAuthenticated, 
    isActiveUser,
    voteCount 
  });

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant={isVoted ? "default" : "secondary"} 
            size="sm" 
            className={cn(
              "flex items-center gap-1",
              isVoted && "bg-blue-600 hover:bg-blue-700"
            )}
            onClick={onClick}
            disabled={!isAuthenticated ? false : disabled}
            aria-label={tooltipText}
            type="button"
          >
            <ThumbsUp className={cn(
              "h-4 w-4",
              isVoted && "fill-white"
            )} />
            <span>{voteCount}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default PositionVoteButton;
