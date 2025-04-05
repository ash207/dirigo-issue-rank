
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";

const EmailSentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || "your email address";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-4">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="mx-auto w-16 h-16 rounded-full bg-transparent border-2 border-white flex items-center justify-center">
          <Mail className="h-8 w-8" />
        </div>
        
        <h1 className="text-4xl font-bold">Check your email</h1>
        
        <p className="text-xl">
          We just sent a verification link to {email}.
        </p>
        
        <Button 
          onClick={() => navigate("/sign-in")} 
          className="mt-8 bg-white text-black hover:bg-gray-200 px-6 py-4 rounded-md text-lg w-auto inline-flex items-center gap-2"
        >
          Go to login <span className="ml-1">→</span>
        </Button>
      </div>
    </div>
  );
};

export default EmailSentPage;
