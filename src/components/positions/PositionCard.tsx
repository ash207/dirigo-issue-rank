
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp } from "lucide-react";

interface PositionCardProps {
  id: string;
  title: string;
  content: string;
  author: {
    name: string;
    verificationLevel: "unverified" | "basic" | "voter" | "official";
  };
  votes: number;
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

const PositionCard = ({ 
  id,
  title,
  content,
  author,
  votes
}: PositionCardProps) => {
  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-lg">{title}</h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground flex items-center">
              <ThumbsUp size={14} className="mr-1" /> {votes}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-700 mb-4">{content}</p>
        <div className="flex justify-between items-center">
          <span className="text-sm">
            Posted by <span className={getVerificationColor(author.verificationLevel)}>@{author.name}</span>
          </span>
          <Badge variant="outline" className="text-xs">
            {author.verificationLevel.charAt(0).toUpperCase() + author.verificationLevel.slice(1)}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default PositionCard;
