
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Globe, Landmark, Flag } from "lucide-react";

interface IssueCardProps {
  id: string;
  title: string;
  category: string;
  scope?: string;
  votes: number;
  positions: number;
}

const IssueCard = ({ id, title, category, scope = "state", votes, positions }: IssueCardProps) => {
  const getScopeIcon = (scope: string) => {
    switch (scope) {
      case "local":
        return <Landmark className="h-4 w-4 mr-1" />;
      case "international":
        return <Globe className="h-4 w-4 mr-1" />;
      default:
        return <Flag className="h-4 w-4 mr-1" />;
    }
  };

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
          <div className="flex justify-between items-center mt-2">
            <Badge variant="outline" className="flex items-center">
              {getScopeIcon(scope)}
              <span className="capitalize">{scope}</span>
            </Badge>
            <Badge variant="outline">View Details</Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default IssueCard;
