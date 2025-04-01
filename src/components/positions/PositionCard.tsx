
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
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
  isAuthenticated?: boolean;
  userVotedPosition?: string | null;
  onVote?: (id: string) => void;
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
  isAuthenticated = false,
  userVotedPosition,
  onVote
}: PositionCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const hasVoted = userVotedPosition === id;
  
  const handleVote = () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to vote", {
        description: "You need to be logged in to vote on positions.",
        action: {
          label: "Sign In",
          onClick: () => window.location.href = "/sign-in"
        }
      });
      return;
    }
    
    if (onVote) {
      onVote(id);
    }
  };

  return (
    <Card 
      className={`mb-4 ${interactive ? "transition-all duration-150 hover:shadow-md" : ""}`}
      onMouseEnter={() => interactive && setIsHovered(true)}
      onMouseLeave={() => interactive && setIsHovered(false)}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-lg">{title}</h3>
          <div className="flex items-center gap-2">
            {interactive ? (
              <HoverCard openDelay={300}>
                <HoverCardTrigger asChild>
                  <Button 
                    variant={hasVoted ? "default" : "outline"}
                    size="sm"
                    onClick={handleVote}
                    className="flex items-center gap-1"
                  >
                    <ThumbsUp size={16} /> 
                    <span>{votes}</span>
                  </Button>
                </HoverCardTrigger>
                <HoverCardContent className="w-auto">
                  <p className="text-sm">{hasVoted ? "You voted for this position" : "Vote for this position"}</p>
                </HoverCardContent>
              </HoverCard>
            ) : (
              <span className="text-sm text-muted-foreground flex items-center">
                <ThumbsUp size={14} className="mr-1" /> {votes}
              </span>
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
