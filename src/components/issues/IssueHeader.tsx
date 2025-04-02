
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, Landmark, Flag } from "lucide-react";

interface IssueHeaderProps {
  issue: {
    id: string;
    title: string;
    category: string;
    scope?: string;
    description: string;
    createdAt: string;
    votes: number;
    creator: {
      name: string;
      verificationLevel: "unverified" | "basic" | "voter" | "official";
    };
  };
  positionsCount: number;
}

const IssueHeader = ({ issue, positionsCount }: IssueHeaderProps) => {
  const getScopeIcon = (scope: string = "state") => {
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
    <Card className="mb-8">
      <CardHeader>
        <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-dirigo-blue">{issue.category}</Badge>
            <Badge variant="outline" className="flex items-center">
              {getScopeIcon(issue.scope)}
              <span className="capitalize">{issue.scope || "state"}</span>
            </Badge>
          </div>
          <span className="text-sm text-muted-foreground">
            Posted by <span className="text-verification-voter">@{issue.creator.name}</span>
          </span>
        </div>
        <CardTitle className="text-2xl">{issue.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-700 mb-6">{issue.description}</p>
        
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            {issue.votes} people viewed this issue • {positionsCount} positions
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default IssueHeader;
