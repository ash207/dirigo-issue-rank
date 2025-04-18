
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/contexts/AuthContext";
import IssueHeader from "@/components/issues/IssueHeader";
import PositionsList from "@/components/positions/PositionsList";
import { useIssueData } from "@/hooks/useIssueData";
import { usePositionsData } from "@/hooks/usePositionsData";
import IssueLoadingState from "@/components/issues/IssueLoadingState";
import IssueErrorState from "@/components/issues/IssueErrorState";
import EmptyPositionsState from "@/components/positions/EmptyPositionsState";
import CreatePositionForm from "@/components/positions/CreatePositionForm";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useIssueActions } from "@/hooks/useIssueActions";
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
  const [loading, setLoading] = useState(true);
  const [showAddPosition, setShowAddPosition] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Debug log auth status
  console.log("Auth status:", { isAuthenticated, userId: user?.id });
  
  const { deleteIssue, isDeleting } = useIssueActions(user?.id);

  const issueQuery = useIssueData(id);
  const positionsQuery = usePositionsData(id);

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

  if (loading && (issueQuery.isLoading || positionsQuery.isLoading)) {
    return (
      <Layout>
        <IssueLoadingState />
      </Layout>
    );
  }

  if (issueQuery.error && positionsQuery.error) {
    return (
      <Layout>
        <IssueErrorState />
      </Layout>
    );
  }

  const issue = issueQuery.data || {
    id,
    title: "Issue not found",
    category: "Unknown",
    scope: "state",
    description: "This issue could not be loaded. It may have been deleted or you may not have permission to view it.",
    created_at: new Date().toISOString(),
    creatorName: "Unknown",
    creator_id: ""
  };

  const positions = positionsQuery.data || [];
  
  console.log("Positions to be displayed:", positions, "Count:", positions.length);
  
  const isOwner = user?.id === issue.creator_id;

  const formattedIssue = {
    id: issue.id,
    title: issue.title,
    category: issue.category,
    scope: issue.scope || "state",
    description: issue.description,
    createdAt: issue.created_at,
    votes: 0,
    creator: {
      name: issue.creatorName || "Anonymous",
      verificationLevel: "basic" as const
    }
  };

  const handleRefreshPositions = () => {
    console.log("Refreshing positions");
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
          <IssueHeader 
            issue={formattedIssue} 
            positionsCount={positions.length} 
            isOwner={isOwner}
            onEdit={handleEditIssue}
            onDelete={() => setIsDeleteDialogOpen(true)}
          />
        </div>
        
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
            currentUserId={user?.id}
            onPositionUpdated={handleRefreshPositions}
            onAddPosition={() => setShowAddPosition(true)}
            isActiveUser={true} // Make sure this is set correctly
          />
        )}
        
        <Dialog open={showAddPosition} onOpenChange={setShowAddPosition}>
          <DialogContent className="sm:max-w-[500px]">
            {isAuthenticated && showAddPosition && (
              <CreatePositionForm 
                issueId={id || ""} 
                onSuccess={handleRefreshPositions}
              />
            )}
          </DialogContent>
        </Dialog>
        
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
