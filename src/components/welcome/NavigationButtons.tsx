
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const NavigationButtons = () => {
  const navigate = useNavigate();
  
  return (
    <>
      <Button onClick={() => navigate("/sign-in")}>
        Go to login
      </Button>
      <Button variant="outline" onClick={() => navigate("/")}>
        Return to home page
      </Button>
    </>
  );
};

export default NavigationButtons;
