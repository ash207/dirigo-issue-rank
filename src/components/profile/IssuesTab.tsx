
import { useState } from "react";
import { format } from "date-fns";
import { Book } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Issue } from "@/types/issue";

type IssuesTabProps = {
  issues: Issue[];
  isLoading: boolean;
};

export const IssuesTab = ({ issues, isLoading }: IssuesTabProps) => {
  const navigate = useNavigate();
  
  const handleIssueClick = (issueId: string) => {
    navigate(`/issues/${issueId}`);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Issues Created</CardTitle>
        <CardDescription>
          These are all the issues you have created on DirigoVotes.
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
        ) : issues.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Scope</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {issues.map((issue) => (
                <TableRow 
                  key={issue.id} 
                  className="cursor-pointer hover:bg-muted/60"
                  onClick={() => handleIssueClick(issue.id)}
                >
                  <TableCell className="font-medium">{issue.title}</TableCell>
                  <TableCell>{issue.category}</TableCell>
                  <TableCell>{issue.scope || "state"}</TableCell>
                  <TableCell>{format(new Date(issue.created_at), 'MMM d, yyyy')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8">
            <h3 className="text-lg font-medium mb-2">No issues created yet</h3>
            <p className="text-muted-foreground mb-4">Create your first issue to see it here</p>
            <Button onClick={() => navigate("/issues/create")}>
              Create an Issue
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
