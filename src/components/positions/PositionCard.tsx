
import { useState } from "react";
import { ThumbsUp, ThumbsDown, MoreHorizontal, Pencil, Trash2, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Position {
  id: string;
  title: string;
  content: string;
  created_at: string;
  user_id: string;
  votes: number;
  username?: string;
}

interface PositionCardProps {
  position: Position;
  userVoted: boolean;
  onVote: (positionId: string) => void;
  isOwner: boolean;
  onPositionUpdated?: () => void;
  issueId: string;
  issueTitle?: string;
}

const PositionCard = ({ 
  position, 
  userVoted, 
  onVote, 
  isOwner,
  onPositionUpdated,
  issueId,
  issueTitle = "this issue"
}: PositionCardProps) => {
  const { isAuthenticated } = useAuth();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editContent, setEditContent] = useState(position.content);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from("positions")
        .delete()
        .eq("id", position.id)
        .eq("user_id", position.user_id);
        
      if (error) throw error;
      
      toast.success("Position deleted successfully");
      if (onPositionUpdated) onPositionUpdated();
    } catch (error) {
      console.error("Error deleting position:", error);
      toast.error("Failed to delete position");
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };
  
  const handleEdit = async () => {
    if (!editContent.trim()) {
      toast.error("Position content cannot be empty");
      return;
    }
    
    try {
      const { error } = await supabase
        .from("positions")
        .update({ content: editContent })
        .eq("id", position.id)
        .eq("user_id", position.user_id);
        
      if (error) throw error;
      
      toast.success("Position updated successfully");
      if (onPositionUpdated) onPositionUpdated();
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error("Error updating position:", error);
      toast.error("Failed to update position");
    }
  };
  
  const handleReport = async () => {
    if (!reportReason.trim()) {
      toast.error("Please provide a reason for reporting this position");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.functions.invoke("send-position-report", {
        body: {
          positionId: position.id,
          positionTitle: position.title,
          positionContent: position.content,
          issueId,
          issueTitle,
          reportReason,
        },
      });

      if (error) throw error;

      toast.success("Report submitted successfully");
      setReportReason("");
      setIsReportDialogOpen(false);
    } catch (error) {
      console.error("Error submitting report:", error);
      toast.error("Failed to submit report. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2 flex flex-row justify-between items-start">
        <CardTitle className="text-lg">{position.title}</CardTitle>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {isOwner && (
              <>
                <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)} className="cursor-pointer">
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
              </>
            )}
            
            {isAuthenticated && (
              <DropdownMenuItem 
                onClick={() => setIsReportDialogOpen(true)}
                className="cursor-pointer"
              >
                <Flag className="mr-2 h-4 w-4" />
                Report
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <p className="text-gray-700 mb-4">{position.content}</p>
        
        <div className="flex justify-between items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            className={`flex items-center gap-1 ${userVoted ? 'text-primary' : ''}`}
            onClick={() => onVote(position.id)}
          >
            {userVoted ? <ThumbsUp className="h-4 w-4 fill-primary" /> : <ThumbsUp className="h-4 w-4" />}
            <span>{position.votes}</span>
          </Button>
        </div>
      </CardContent>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Position</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this position? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Position</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <Textarea 
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              placeholder="Update your position..."
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter className="sm:justify-between">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Report Dialog */}
      <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Report Position</DialogTitle>
            <DialogDescription>
              Please explain why you're reporting this position. Our team will review your report.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <Textarea 
              placeholder="Please describe why you're reporting this position..."
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter className="sm:justify-between">
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isSubmitting}>
                Cancel
              </Button>
            </DialogClose>
            <Button onClick={handleReport} disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Report"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default PositionCard;
