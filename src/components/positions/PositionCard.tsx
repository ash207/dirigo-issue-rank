
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";
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
}

const PositionCard = ({ id, content, author, votes: initialVotes, userVoted: initialUserVoted }: PositionCardProps) => {
  const [votes, setVotes] = useState(initialVotes);
  const [userVoted, setUserVoted] = useState<"up" | null>(initialUserVoted || null);

  const handleVote = () => {
    if (userVoted === "up") {
      // Removing vote
      setUserVoted(null);
      setVotes(votes - 1);
    } else {
      // Adding a new vote
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
        </div>
        <div className="text-xs text-muted-foreground">
          Rank: #{id}
        </div>
      </CardFooter>
    </Card>
  );
};

export default PositionCard;
