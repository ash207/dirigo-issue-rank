
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

interface IssueCardProps {
  id: string;
  title: string;
  category: string;
  votes: number;
  positions: number;
}

const IssueCard = ({ id, title, category, votes, positions }: IssueCardProps) => {
  return (
    <Link to={`/issues/${id}`}>
      <Card className="h-full transition-all hover:shadow-md border-2 hover:border-primary">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <Badge className="bg-dirigo-blue">{category}</Badge>
            <div className="text-sm text-muted-foreground">
              {votes} votes • {positions} positions
            </div>
          </div>
          <CardTitle className="text-lg mt-2">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-end mt-2">
            <Badge variant="outline" className="ml-auto">View Details</Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default IssueCard;
