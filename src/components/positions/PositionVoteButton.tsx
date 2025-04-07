
import { ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PositionVoteButtonProps {
  voteCount: number;
  isVoted: boolean;
  onClick: () => void;
  disabled?: boolean;
  positionTitle?: string;
}

const PositionVoteButton = ({
  voteCount,
  isVoted,
  onClick,
  disabled = false,
  positionTitle = "this position"
}: PositionVoteButtonProps) => {
  return (
    <Button 
      variant={isVoted ? "default" : "ghost"} 
      size="sm" 
      className={cn(
        "flex items-center gap-1",
        isVoted && "bg-blue-600 hover:bg-blue-700"
      )}
      onClick={onClick}
      disabled={disabled}
      title={isVoted ? `Unvote ${positionTitle}` : `Vote for ${positionTitle}`}
    >
      <ThumbsUp className={cn(
        "h-4 w-4",
        isVoted && "fill-white"
      )} />
      <span>{voteCount}</span>
    </Button>
  );
};

export default PositionVoteButton;
