
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { UserRound } from "lucide-react";

const NavigationButtons = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {user?.id && (
        <Button onClick={() => navigate(`/profile/${user.id}`)} className="flex items-center gap-2">
          <UserRound size={16} />
          View Your Public Profile
        </Button>
      )}
      <Button onClick={() => navigate("/sign-in")}>
        Go to login
      </Button>
      <Button variant="outline" onClick={() => navigate("/")}>
        Return to home page
      </Button>
    </div>
  );
};

export default NavigationButtons;
