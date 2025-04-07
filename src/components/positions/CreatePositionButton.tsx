
import { Button } from "@/components/ui/button";

interface CreatePositionButtonProps {
  isAuthenticated: boolean;
  onAddPosition: () => void;
}

const CreatePositionButton = ({ isAuthenticated, onAddPosition }: CreatePositionButtonProps) => {
  const handleClick = () => {
    if (isAuthenticated) {
      onAddPosition();
    } else {
      window.location.href = "/sign-in";
    }
  };

  return (
    <Button 
      onClick={handleClick} 
      className="w-full sm:w-auto"
      variant={isAuthenticated ? "default" : "outline"}
    >
      {isAuthenticated ? "Add Your Position" : "Sign in to add your position"}
    </Button>
  );
};

export default CreatePositionButton;
