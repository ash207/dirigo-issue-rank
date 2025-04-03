
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/contexts/AuthContext";
import IssueHeader from "@/components/issues/IssueHeader";
import PositionsList from "@/components/positions/PositionsList";
import usePositionVotes from "@/hooks/usePositionVotes";
import { useIssueData } from "@/hooks/useIssueData";
import { usePositionsData } from "@/hooks/usePositionsData";
import IssueLoadingState from "@/components/issues/IssueLoadingState";
import IssueErrorState from "@/components/issues/IssueErrorState";
import EmptyPositionsState from "@/components/positions/EmptyPositionsState";
import CreatePositionForm from "@/components/positions/CreatePositionForm";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useIssueActions } from "@/hooks/useIssueActions";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const IssueDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { userVotedPosition, positionVotes, handleVote } = usePositionVotes(id, user?.id, isAuthenticated);
  const [loading, setLoading] = useState(true);
  const [showAddPosition, setShowAddPosition] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const { deleteIssue, isDeleting } = useIssueActions(user?.id);

  // Fetch issue and position data using our custom hooks
  const issueQuery = useIssueData(id);
  const positionsQuery = usePositionsData(id);

  // Handle errors
  useEffect(() => {
    if (issueQuery.error) {
      toast.error("Failed to load issue details");
      console.error("Issue query error:", issueQuery.error);
    }
    
    if (positionsQuery.error) {
      toast.error("Failed to load positions");
      console.error("Positions query error:", positionsQuery.error);
    }
    
    setLoading(false);
  }, [issueQuery.error, positionsQuery.error]);

  // Show loading state
  if (loading && (issueQuery.isLoading || positionsQuery.isLoading)) {
    return (
      <Layout>
        <IssueLoadingState />
      </Layout>
    );
  }

  // Show error state if both queries failed
  if (issueQuery.error && positionsQuery.error) {
    return (
      <Layout>
        <IssueErrorState />
      </Layout>
    );
  }

  // Fallback to mock data if the real data failed to load
  const issue = issueQuery.data || {
    id,
    title: "Issue not found",
    category: "Unknown",
    scope: "state", // Default to state level
    description: "This issue could not be loaded. It may have been deleted or you may not have permission to view it.",
    created_at: new Date().toISOString(),
    creatorName: "Unknown",
    creator_id: ""
  };

  const positions = positionsQuery.data || [];
  
  console.log("Positions to be displayed:", positions, "Count:", positions.length);
  
  const isOwner = user?.id === issue.creator_id;

  // Format the issue for IssueHeader component
  const formattedIssue = {
    id: issue.id,
    title: issue.title,
    category: issue.category,
    scope: issue.scope || "state", // Default to state if not specified
    description: issue.description,
    createdAt: issue.created_at,
    votes: positions.reduce((sum, pos) => sum + pos.votes, 0),
    creator: {
      name: issue.creatorName || "Anonymous",
      verificationLevel: "basic" as const
    }
  };

  const handleRefreshPositions = () => {
    positionsQuery.refetch();
    setShowAddPosition(false);
  };
  
  const handleDeleteIssue = async () => {
    if (await deleteIssue(issue.id, issue.creator_id)) {
      // Navigation handled in the hook
    }
    setIsDeleteDialogOpen(false);
  };
  
  const handleEditIssue = () => {
    navigate(`/issues/edit/${issue.id}`);
  };

  return (
    <Layout>
      <div className="container mx-auto max-w-4xl">
        <div className="flex justify-between items-start mb-4">
          <IssueHeader issue={formattedIssue} positionsCount={positions.length} />
          
          {isOwner && (
            <div className="mt-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleEditIssue} className="cursor-pointer">
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setIsDeleteDialogOpen(true)}
                    className="text-destructive cursor-pointer"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
        
        <Dialog open={showAddPosition} onOpenChange={setShowAddPosition}>
          {positions.length === 0 ? (
            <EmptyPositionsState 
              issueId={id || ""} 
              onAddPosition={() => setShowAddPosition(true)}
            />
          ) : (
            <PositionsList 
              positions={positions}
              issueId={id || ""}
              isAuthenticated={isAuthenticated}
              userVotedPosition={userVotedPosition}
              positionVotes={positionVotes}
              onVote={handleVote}
              currentUserId={user?.id}
              onPositionUpdated={handleRefreshPositions}
            />
          )}
          
          {isAuthenticated && (
            <DialogTrigger className="hidden">
              Open Form
            </DialogTrigger>
          )}
          
          {showAddPosition && (
            <CreatePositionForm 
              issueId={id || ""} 
              onSuccess={handleRefreshPositions}
            />
          )}
        </Dialog>
        
        {/* Delete Issue Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to delete this issue?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your issue and all positions associated with it.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteIssue} 
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
};

export default IssueDetail;
