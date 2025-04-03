
import { ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PositionVoteButtonProps {
  votes: number;
  userVoted: boolean;
  onVote: () => void;
}

const PositionVoteButton = ({ votes, userVoted, onVote }: PositionVoteButtonProps) => {
  return (
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
  );
};

export default PositionVoteButton;
