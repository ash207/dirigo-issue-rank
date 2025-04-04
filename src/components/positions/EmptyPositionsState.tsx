
import React from "react";
import { MessageSquareOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

interface EmptyPositionsStateProps {
  issueId: string;
  onAddPosition?: () => void;
}

const EmptyPositionsState: React.FC<EmptyPositionsStateProps> = ({ issueId, onAddPosition }) => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="flex flex-col items-center text-center py-12 px-6 bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl shadow-sm mt-4 mb-6 border border-blue-100">
      <div className="bg-blue-100 p-5 rounded-full mb-5">
        <MessageSquareOff size={30} className="text-dirigo-blue opacity-80" />
      </div>
      <h3 className="text-xl font-semibold mb-3">No positions yet</h3>
      <p className="text-muted-foreground max-w-md mb-6">
        Be the first to add your position on this issue and start the conversation!
      </p>
      
      {isAuthenticated ? (
        <Button onClick={onAddPosition} className="animate-pulse">
          Add Your Position
        </Button>
      ) : (
        <Button 
          variant="outline" 
          onClick={() => window.location.href = "/sign-in"}
        >
          Sign in to add your position
        </Button>
      )}
    </div>
  );
};

export default EmptyPositionsState;
