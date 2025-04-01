
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";
import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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
  isDraggable?: boolean;
}

const PositionCard = ({ 
  id, 
  content, 
  author, 
  votes: initialVotes, 
  userVoted: initialUserVoted,
  userRank: initialUserRank,
  usedRanks = [],
  onRankChange,
  isDraggable = false
}: PositionCardProps) => {
  const [votes, setVotes] = useState(initialVotes);
  const [userVoted, setUserVoted] = useState<"up" | null>(initialUserVoted || null);
  const [userRank, setUserRank] = useState<number | null>(initialUserRank || null);

  // Set up sortable if the card is draggable
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id,
    disabled: !isDraggable || !userVoted
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : 0,
    position: 'relative' as const
  };

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

  const getVerificationColor = () => {
    return `bg-verification-${author.verificationLevel}`;
  };

  return (
    <Card 
      className={`mb-4 ${isDraggable && userVoted ? 'cursor-grab active:cursor-grabbing' : ''}`}
      ref={setNodeRef}
      style={style}
      {...(isDraggable && userVoted ? { ...attributes, ...listeners } : {})}
    >
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
          
          {userVoted === "up" && userRank && (
            <Badge variant="outline" className="ml-2">
              Rank #{userRank} {isDraggable ? "• Drag to reorder" : ""}
            </Badge>
          )}
        </div>
        <div className="text-xs text-muted-foreground">
          ID: {id}
        </div>
      </CardFooter>
    </Card>
  );
};

export default PositionCard;
