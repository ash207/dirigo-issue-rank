
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface IssueHeaderProps {
  issue: {
    id: string;
    title: string;
    category: string;
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
  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex justify-between items-start mb-2">
          <Badge className="bg-dirigo-blue">{issue.category}</Badge>
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
