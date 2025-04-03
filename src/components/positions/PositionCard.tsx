
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { toast } from "sonner";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { usePositionActions } from "@/hooks/usePositionActions";

interface PositionCardProps {
  id: string;
  title: string;
  content: string;
  author: {
    name: string;
    verificationLevel: "unverified" | "basic" | "voter" | "official";
  };
  votes: number;
  interactive?: boolean;
  isAuthenticated?: boolean;
  userVotedPosition?: string | null;
  onVote?: (id: string) => void;
  authorId?: string;
  currentUserId?: string;
  onPositionUpdated?: () => void;
}

const getVerificationColor = (level: string) => {
  switch (level) {
    case "official":
      return "text-verification-official font-bold";
    case "voter":
      return "text-verification-voter";
    case "basic":
      return "text-verification-basic";
    default:
      return "text-verification-unverified";
  }
};

const VerificationBadge = ({ level }: { level: string }) => {
  return (
    <Badge variant="outline" className="text-xs">
      {level.charAt(0).toUpperCase() + level.slice(1)}
    </Badge>
  );
};

const PositionCard = ({ 
  id,
  title,
  content,
  author,
  votes,
  interactive = true,
  isAuthenticated = false,
  userVotedPosition,
  onVote,
  authorId,
  currentUserId,
  onPositionUpdated
}: PositionCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const hasVoted = userVotedPosition === id;
  const isOwner = currentUserId && authorId && currentUserId === authorId;
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const [editContent, setEditContent] = useState(content);
  
  const { deletePosition, updatePosition, isDeleting, isEditing } = usePositionActions(currentUserId);
  
  const handleVote = () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to vote", {
        description: "You need to be logged in to vote on positions.",
        action: {
          label: "Sign In",
          onClick: () => window.location.href = "/sign-in"
        }
      });
      return;
    }
    
    if (onVote) {
      onVote(id);
    }
  };

  const handleDelete = async () => {
    if (!authorId) return;
    
    const success = await deletePosition(id, authorId);
    if (success && onPositionUpdated) {
      onPositionUpdated();
    }
    setIsDeleteDialogOpen(false);
  };

  const handleEdit = async () => {
    if (!authorId) return;
    
    const success = await updatePosition(id, authorId, {
      title: editTitle,
      content: editContent
    });
    
    if (success && onPositionUpdated) {
      onPositionUpdated();
    }
    setIsEditDialogOpen(false);
  };

  return (
    <>
      <Card 
        className={`mb-4 ${interactive ? "transition-all duration-150 hover:shadow-md" : ""}`}
        onMouseEnter={() => interactive && setIsHovered(true)}
        onMouseLeave={() => interactive && setIsHovered(false)}
      >
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <h3 className="font-bold text-lg">{title}</h3>
            <div className="flex items-center gap-2">
              {interactive ? (
                <>
                  <HoverCard openDelay={300}>
                    <HoverCardTrigger asChild>
                      <Button 
                        variant={hasVoted ? "default" : "outline"}
                        size="sm"
                        onClick={handleVote}
                        className="flex items-center gap-1"
                      >
                        <ThumbsUp size={16} /> 
                        <span>{votes}</span>
                      </Button>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-auto">
                      <p className="text-sm">{hasVoted ? "You voted for this position" : "Vote for this position"}</p>
                    </HoverCardContent>
                  </HoverCard>
                  
                  {isOwner && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive focus:text-destructive" 
                          onClick={() => setIsDeleteDialogOpen(true)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </>
              ) : (
                <span className="text-sm text-muted-foreground flex items-center">
                  <ThumbsUp size={14} className="mr-1" /> {votes}
                </span>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 mb-4">{content}</p>
          <div className="flex justify-between items-center">
            <span className="text-sm">
              Posted by <span className={getVerificationColor(author.verificationLevel)}>@{author.name}</span>
            </span>
            <VerificationBadge level={author.verificationLevel} />
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this position?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your position and remove all votes associated with it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Position Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Position</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Input 
                placeholder="Position title" 
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Textarea 
                placeholder="Position content" 
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setIsEditDialogOpen(false)} disabled={isEditing}>
              Cancel
            </Button>
            <Button type="button" onClick={handleEdit} disabled={isEditing || !editTitle || !editContent}>
              {isEditing ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PositionCard;
