
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
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
}

const PositionCard = ({ 
  id, 
  content, 
  author, 
  votes
}: PositionCardProps) => {
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
        </div>
        <div className="text-xs text-muted-foreground">
          ID: {id}
        </div>
      </CardFooter>
    </Card>
  );
};

export default PositionCard;
