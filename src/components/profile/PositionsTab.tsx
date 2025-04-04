
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Position } from "@/types/position";

type PositionsTabProps = {
  positions: Position[];
  isLoading: boolean;
};

export const PositionsTab = ({ positions, isLoading }: PositionsTabProps) => {
  const navigate = useNavigate();
  
  const handlePositionClick = (issueId: string) => {
    navigate(`/issues/${issueId}`);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Positions Taken</CardTitle>
        <CardDescription>
          These are all the positions you have taken on various issues.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-pulse space-y-2">
              <div className="h-6 w-64 bg-slate-200 rounded"></div>
              <div className="h-6 w-48 bg-slate-200 rounded"></div>
            </div>
          </div>
        ) : positions.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Position Title</TableHead>
                <TableHead>Issue</TableHead>
                <TableHead>Votes</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {positions.map((position) => (
                <TableRow 
                  key={position.id}
                  className="cursor-pointer hover:bg-muted/60"
                  onClick={() => handlePositionClick(position.issue_id)}
                >
                  <TableCell className="font-medium">{position.title}</TableCell>
                  <TableCell>{position.issues?.title}</TableCell>
                  <TableCell>{position.votes}</TableCell>
                  <TableCell>{format(new Date(position.created_at), 'MMM d, yyyy')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8">
            <h3 className="text-lg font-medium mb-2">No positions taken yet</h3>
            <p className="text-muted-foreground mb-4">Take a position on an issue to see it here</p>
            <Button onClick={() => navigate("/issues")}>
              Browse Issues
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
