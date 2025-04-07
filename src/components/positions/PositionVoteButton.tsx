
// This component is now simplified without voting functionality
import { Button } from "@/components/ui/button";

interface PositionVoteButtonProps {
  positionTitle?: string;
}

const PositionVoteButton = ({ positionTitle = "this position" }: PositionVoteButtonProps) => {
  return (
    <Button 
      variant="ghost" 
      size="sm" 
      className="flex items-center gap-1 invisible"
    >
      {/* Hidden button, kept for layout consistency */}
    </Button>
  );
};

export default PositionVoteButton;
