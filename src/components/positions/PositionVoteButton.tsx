
import { ThumbsUp, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface PositionVoteButtonProps {
  voteCount: number;
  isVoted: boolean;
  onClick: () => void;
  onUpClick?: () => void;
  disabled?: boolean;
  positionTitle?: string;
  isActiveUser?: boolean;
  isAuthenticated?: boolean;
}

const PositionVoteButton = ({
  voteCount,
  isVoted,
  onClick,
  onUpClick,
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
    <div className="flex items-center gap-2">
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
              disabled={disabled || (!isAuthenticated && !isVoted)}
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

      {/* Up Arrow Button */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={onUpClick}
              disabled={!isAuthenticated}
              aria-label="Vote privacy options"
              type="button"
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>View voting privacy options</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default PositionVoteButton;
