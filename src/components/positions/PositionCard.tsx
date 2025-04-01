
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, ArrowUp, ArrowDown } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { 
  HoverCard,
  HoverCardTrigger,
  HoverCardContent
} from "@/components/ui/hover-card";
import { toast } from "sonner";

interface PositionCardProps {
  id: string;
  title: string;
  content: string;
  author: {
    name: string;
    verificationLevel: "unverified" | "basic" | "voter" | "official";
  };
  votes: number;
  interactive?: boolean;
  rank?: number | null;
  onRankChange?: (id: string, newRank: number) => void;
  totalPositions?: number;
  isAuthenticated?: boolean;
}

const getVerificationColor = (level: string) => {
  switch (level) {
    case "official":
      return "text-verification-official font-bold";
    case "voter":
      return "text-verification-voter";
    case "basic":
      return "text-verification-basic";
    default:
      return "text-verification-unverified";
  }
};

const VerificationBadge = ({ level }: { level: string }) => {
  return (
    <Badge variant="outline" className="text-xs">
      {level.charAt(0).toUpperCase() + level.slice(1)}
    </Badge>
  );
};

const PositionCard = ({ 
  id,
  title,
  content,
  author,
  votes,
  interactive = true,
  rank = null,
  onRankChange,
  totalPositions = 0,
  isAuthenticated = false
}: PositionCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Handle selecting a new rank
  const handleRankSelect = (newRank: number) => {
    if (!isAuthenticated) {
      toast.error("Please sign in to rank positions", {
        description: "You need to be logged in to rank positions.",
        action: {
          label: "Sign In",
          onClick: () => window.location.href = "/sign-in"
        }
      });
      return;
    }
    
    if (onRankChange) {
      onRankChange(id, newRank);
    }
  };

  // Generate the rank options to display
  const renderRankOptions = () => {
    const options = [];
    for (let i = 1; i <= Math.min(totalPositions, 10); i++) {
      options.push(
        <Button 
          key={i}
          variant={rank === i ? "default" : "outline"} 
          size="sm"
          onClick={() => handleRankSelect(i)}
          className="w-8 h-8 p-0"
        >
          {i}
        </Button>
      );
    }
    return (
      <div className="flex flex-wrap gap-1 max-w-[140px]">
        {options}
      </div>
    );
  };

  return (
    <Card 
      className={`mb-4 ${interactive ? "transition-all duration-150 hover:shadow-md" : ""}`}
      onMouseEnter={() => interactive && setIsHovered(true)}
      onMouseLeave={() => interactive && setIsHovered(false)}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            {rank !== null && (
              <div className="bg-dirigo-blue text-white rounded-full w-6 h-6 flex items-center justify-center">
                {rank}
              </div>
            )}
            <h3 className="font-bold text-lg">{title}</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground flex items-center">
              <ThumbsUp size={14} className="mr-1" /> {votes}
            </span>
            
            {interactive && (
              <Popover>
                <HoverCard openDelay={300}>
                  <HoverCardTrigger asChild>
                    <PopoverTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-8 w-8 p-0"
                      >
                        <ArrowUp size={16} />
                      </Button>
                    </PopoverTrigger>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-auto">
                    <p className="text-sm">Rank this position</p>
                  </HoverCardContent>
                </HoverCard>
                <PopoverContent className="w-auto p-2" align="end">
                  <div className="text-sm font-medium mb-2">Select rank:</div>
                  {renderRankOptions()}
                </PopoverContent>
              </Popover>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-700 mb-4">{content}</p>
        <div className="flex justify-between items-center">
          <span className="text-sm">
            Posted by <span className={getVerificationColor(author.verificationLevel)}>@{author.name}</span>
          </span>
          <VerificationBadge level={author.verificationLevel} />
        </div>
      </CardContent>
    </Card>
  );
};

export default PositionCard;
