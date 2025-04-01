
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
  return (
    <Card className="mb-4">
      <CardContent className="pt-6">
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
