
import { Button } from "@/components/ui/button";

interface CreatePositionButtonProps {
  isAuthenticated: boolean;
  onClick: () => void;
}

const CreatePositionButton = ({ isAuthenticated, onClick }: CreatePositionButtonProps) => {
  if (isAuthenticated) {
    return <Button onClick={onClick}>Add Your Position</Button>;
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
