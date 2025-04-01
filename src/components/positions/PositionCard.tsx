
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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

  const handleRankSelect = (rank: number) => {
    // Update rank state
    setUserRank(rank);
    
    // If this is a new vote, increment the vote count
    if (!userVoted) {
      setUserVoted("up");
      setVotes(votes + 1);
    }
    
    // Notify parent component of rank change
    if (onRankChange) {
      onRankChange(id, rank);
    }
  };

  const handleRemoveRank = () => {
    // Clear the rank and remove vote
    setUserRank(null);
    setUserVoted(null);
    setVotes(votes > 0 ? votes - 1 : 0);
    
    // Notify parent component
    if (onRankChange) {
      onRankChange(id, null);
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
          <span className="text-sm font-medium">{votes} votes</span>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant={userRank ? "default" : "outline"}
                size="sm"
                className={userRank ? "bg-green-600 hover:bg-green-700" : ""}
              >
                {userRank ? `Ranked #${userRank}` : "Rank this position"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {[1, 2, 3, 4, 5].map((rank) => (
                <DropdownMenuItem 
                  key={rank} 
                  onClick={() => handleRankSelect(rank)}
                  disabled={usedRanks.includes(rank) && userRank !== rank}
                  className={userRank === rank ? "bg-muted" : ""}
                >
                  Rank #{rank} {usedRanks.includes(rank) && userRank !== rank && "(Used)"}
                </DropdownMenuItem>
              ))}
              {userRank && (
                <DropdownMenuItem 
                  onClick={handleRemoveRank}
                  className="text-red-500 hover:text-red-700"
                >
                  Remove ranking
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="text-xs text-muted-foreground">
          ID: {id}
        </div>
      </CardFooter>
    </Card>
  );
};

export default PositionCard;
