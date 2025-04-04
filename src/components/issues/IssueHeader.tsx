import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, Landmark, Flag, MoreHorizontal, Pencil, Trash2, Flag as FlagIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import ReportModal from "./ReportModal";
import { useAuth } from "@/contexts/auth";

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
  isOwner: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

const IssueHeader = ({ issue, positionsCount, isOwner, onEdit, onDelete }: IssueHeaderProps) => {
  const { isAuthenticated } = useAuth();
  const [reportModalOpen, setReportModalOpen] = useState(false);
  
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
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isOwner && (
                <>
                  <DropdownMenuItem onClick={onEdit} className="cursor-pointer">
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={onDelete}
                    className="text-destructive cursor-pointer"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </>
              )}
              
              <DropdownMenuItem 
                onClick={() => setReportModalOpen(true)}
                className="cursor-pointer"
              >
                <FlagIcon className="mr-2 h-4 w-4" />
                Report
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
      
      <ReportModal 
        open={reportModalOpen} 
        onOpenChange={setReportModalOpen} 
        issueId={issue.id}
        issueTitle={issue.title}
      />
    </Card>
  );
};

export default IssueHeader;
