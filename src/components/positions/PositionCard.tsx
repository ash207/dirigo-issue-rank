
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
  userVoted?: "up" | "down" | null;
}

const PositionCard = ({ id, content, author, votes: initialVotes, userVoted: initialUserVoted }: PositionCardProps) => {
  const [votes, setVotes] = useState(initialVotes);
  const [userVoted, setUserVoted] = useState<"up" | "down" | null>(initialUserVoted || null);

  const handleVote = (voteType: "up" | "down") => {
    if (userVoted === voteType) {
      // Removing vote
      setUserVoted(null);
      setVotes(voteType === "up" ? votes - 1 : votes + 1);
    } else {
      // Changing vote or voting new
      const voteChange = userVoted ? 2 : 1;
      setUserVoted(voteType);
      setVotes(voteType === "up" ? votes + voteChange : votes - voteChange);
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
            onClick={() => handleVote("up")}
          >
            <ArrowUp size={16} />
          </Button>
          <span className="text-sm font-medium">{votes}</span>
          <Button 
            variant="ghost" 
            size="sm"
            className={`p-0 h-8 w-8 rounded-full ${userVoted === "down" ? "text-red-600" : ""}`}
            onClick={() => handleVote("down")}
          >
            <ArrowDown size={16} />
          </Button>
        </div>
        <div className="text-xs text-muted-foreground">
          Rank: #{id}
        </div>
      </CardFooter>
    </Card>
  );
};

export default PositionCard;
