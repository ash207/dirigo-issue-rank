
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown } from "lucide-react";
import { useState } from "react";

interface PositionCardProps {
  id: string;
  content: string;
  author: {
    name: string;
    verificationLevel: "unverified" | "basic" | "voter" | "official";
  };
  votes: number;
  userVoted?: "up" | null;
  userRank?: number | null;
  usedRanks?: number[];
  onRankChange?: (positionId: string, rank: number | null) => void;
}

const PositionCard = ({ 
  id, 
  content, 
  author, 
  votes: initialVotes, 
  userVoted: initialUserVoted,
  userRank: initialUserRank,
  usedRanks = [],
  onRankChange
}: PositionCardProps) => {
  const [votes, setVotes] = useState(initialVotes);
  const [userVoted, setUserVoted] = useState<"up" | null>(initialUserVoted || null);
  const [userRank, setUserRank] = useState<number | null>(initialUserRank || null);

  const handleVote = () => {
    if (userVoted === "up") {
      // Removing vote
      setUserVoted(null);
      setVotes(votes - 1);
      
      // Clear the rank and notify parent component
      if (onRankChange) {
        onRankChange(id, null);
      }
      setUserRank(null);
    } else {
      // Adding a new vote
      setUserVoted("up");
      setVotes(votes + 1);
      
      // If no rank selected yet, find the first available rank
      if (!userRank) {
        const availableRanks = [1, 2, 3, 4, 5].filter(rank => !usedRanks.includes(rank));
        if (availableRanks.length > 0) {
          const newRank = availableRanks[0];
          setUserRank(newRank);
          if (onRankChange) {
            onRankChange(id, newRank);
          }
        }
      }
    }
  };

  const handleRankUp = () => {
    if (!userRank || userRank <= 1) return;
    
    const newRank = userRank - 1;
    setUserRank(newRank);
    
    if (onRankChange) {
      onRankChange(id, newRank);
    }

    // Ensure vote is added if they're ranking
    if (!userVoted) {
      setUserVoted("up");
      setVotes(votes + 1);
    }
  };

  const handleRankDown = () => {
    if (!userRank || userRank >= 5) return;
    
    const newRank = userRank + 1;
    setUserRank(newRank);
    
    if (onRankChange) {
      onRankChange(id, newRank);
    }

    // Ensure vote is added if they're ranking
    if (!userVoted) {
      setUserVoted("up");
      setVotes(votes + 1);
    }
  };

  const getVerificationColor = () => {
    return `bg-verification-${author.verificationLevel}`;
  };

  // Calculate sizes for arrows based on current rank
  const getArrowSizes = (direction: 'up' | 'down') => {
    if (!userVoted || !userRank) return 16; // Default size

    // For up arrows
    if (direction === 'up') {
      if (userRank === 1) return 16; // Can't go higher
      if (userRank === 2) return 20;
      if (userRank === 3) return 24;
      if (userRank === 4) return 28;
      return 32; // rank 5 (biggest arrow)
    }
    
    // For down arrows
    else {
      if (userRank === 5) return 16; // Can't go lower
      if (userRank === 4) return 20;
      if (userRank === 3) return 24;
      if (userRank === 2) return 28;
      return 32; // rank 1 (biggest arrow)
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Badge className={getVerificationColor()}>{author.name}</Badge>
            <span className="text-xs text-muted-foreground">
              {author.verificationLevel.charAt(0).toUpperCase() + author.verificationLevel.slice(1)} User
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-700">{content}</p>
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className={`p-0 h-8 w-8 rounded-full ${userVoted === "up" ? "text-green-600" : ""}`}
            onClick={handleVote}
          >
            <ArrowUp size={16} />
          </Button>
          <span className="text-sm font-medium">{votes}</span>
          
          {userVoted === "up" && (
            <div className="flex flex-col ml-2 items-center">
              <Button 
                variant="ghost" 
                size="sm"
                className="p-0 h-8 w-8"
                onClick={handleRankUp}
                disabled={!userRank || userRank <= 1}
              >
                <ArrowUp size={getArrowSizes('up')} />
              </Button>
              {userRank && (
                <span className="text-sm font-medium mx-1">Rank #{userRank}</span>
              )}
              <Button 
                variant="ghost" 
                size="sm"
                className="p-0 h-8 w-8"
                onClick={handleRankDown}
                disabled={!userRank || userRank >= 5}
              >
                <ArrowDown size={getArrowSizes('down')} />
              </Button>
            </div>
          )}
        </div>
        <div className="text-xs text-muted-foreground">
          Rank: #{id}
        </div>
      </CardFooter>
    </Card>
  );
};

export default PositionCard;
