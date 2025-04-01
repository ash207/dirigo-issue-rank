
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";
import { useState } from "react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

  const handleRankSelect = (rank: number) => {
    // Update our rank state
    setUserRank(rank);
    
    // Notify parent component of rank change
    if (onRankChange) {
      onRankChange(id, rank);
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
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                disabled={!userVoted}
                className="ml-2"
              >
                {userRank ? `Rank #${userRank}` : "Rank"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {[1, 2, 3, 4, 5].map((rank) => (
                <DropdownMenuItem 
                  key={rank} 
                  onClick={() => handleRankSelect(rank)}
                  className={userRank === rank ? "bg-muted" : ""}
                >
                  Rank #{rank} {usedRanks.includes(rank) && userRank !== rank && "(Will reorder)"}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="text-xs text-muted-foreground">
          Rank: #{id}
        </div>
      </CardFooter>
    </Card>
  );
};

export default PositionCard;
