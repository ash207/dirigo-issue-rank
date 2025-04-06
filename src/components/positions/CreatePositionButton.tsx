
import { Button } from "@/components/ui/button";

interface CreatePositionButtonProps {
  isAuthenticated: boolean;
  onAddPosition?: () => void;
}

const CreatePositionButton = ({ isAuthenticated, onAddPosition }: CreatePositionButtonProps) => {
  if (isAuthenticated) {
    return <Button onClick={onAddPosition}>Add Your Position</Button>;
  }

  return (
    <Button 
      variant="outline"
      onClick={() => window.location.href = "/sign-in"}
      className="w-full sm:w-auto"
    >
      Sign in to add your position
    </Button>
  );
};

export default CreatePositionButton;
