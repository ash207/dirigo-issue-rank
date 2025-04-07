
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import PositionCardMenu from "./PositionCardMenu";
import DeletePositionDialog from "./dialogs/DeletePositionDialog";
import EditPositionDialog from "./dialogs/EditPositionDialog";
import ReportPositionDialog from "./dialogs/ReportPositionDialog";
import PositionVoteButton from "./PositionVoteButton";
import { VotePrivacyDialog } from "./dialogs/VotePrivacyDialog";
import { VotePrivacyLevel } from "./dialogs/VotePrivacyDialog";

interface PositionCardProps {
  id: string;
  title: string;
  content: string;
  author: {
    name: string;
    verificationLevel: "unverified" | "basic" | "voter" | "official";
  };
  isAuthenticated: boolean;
  isActiveUser?: boolean;
  currentUserId?: string;
  author_id?: string;
  onPositionUpdated?: () => void;
  issueId?: string;
  issueTitle?: string;
  voteCount?: number;
  isVoted?: boolean;
  onVote?: (positionId: string, privacyLevel?: VotePrivacyLevel) => void;
  isVoting?: boolean;
}

const PositionCard = ({
  id,
  title,
  content,
  author,
  isAuthenticated,
  isActiveUser = true,
  author_id,
  currentUserId,
  onPositionUpdated,
  issueId,
  issueTitle = "this issue",
  voteCount = 0,
  isVoted = false,
  onVote,
  isVoting = false
}: PositionCardProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [isVotePrivacyDialogOpen, setIsVotePrivacyDialogOpen] = useState(false);
  
  // Check if current user is the author of this position
  const isOwner = author_id && currentUserId && author_id === currentUserId;

  const handleVoteClick = () => {
    if (onVote) {
      if (isVoted) {
        // If already voted, just call onVote directly to toggle vote off
        onVote(id);
      } else {
        // If not voted, open privacy dialog first
        setIsVotePrivacyDialogOpen(true);
      }
    }
  };

  const handlePrivacySelected = (privacyLevel: VotePrivacyLevel) => {
    if (onVote) {
      onVote(id, privacyLevel);
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2 flex flex-row justify-between items-start">
        <CardTitle className="text-lg">{title}</CardTitle>
        
        <PositionCardMenu 
          isOwner={!!isOwner}
          isAuthenticated={isAuthenticated}
          onEdit={() => setIsEditDialogOpen(true)}
          onDelete={() => setIsDeleteDialogOpen(true)}
          onReport={() => setIsReportDialogOpen(true)}
        />
      </CardHeader>
      <CardContent>
        <p className="text-gray-700 mb-4">{content}</p>
      </CardContent>
      <CardFooter className="flex justify-between items-center pt-0">
        <div className="text-sm text-muted-foreground">
          Posted by {author.name}
        </div>

        {onVote && (
          <PositionVoteButton
            voteCount={voteCount}
            isVoted={isVoted}
            onClick={handleVoteClick}
            disabled={isVoting || (isOwner && !isVoted)}
            positionTitle={title}
          />
        )}
      </CardFooter>
      
      {/* Dialogs */}
      <DeletePositionDialog
        id={id}
        author_id={author_id}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onPositionDeleted={onPositionUpdated}
      />
      
      <EditPositionDialog
        id={id}
        initialContent={content}
        author_id={author_id}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onPositionUpdated={onPositionUpdated}
      />
      
      <ReportPositionDialog
        positionId={id}
        positionTitle={title}
        positionContent={content}
        issueId={issueId}
        issueTitle={issueTitle}
        open={isReportDialogOpen}
        onOpenChange={setIsReportDialogOpen}
      />

      <VotePrivacyDialog
        open={isVotePrivacyDialogOpen}
        onOpenChange={setIsVotePrivacyDialogOpen}
        onPrivacySelected={handlePrivacySelected}
        positionTitle={title}
      />
    </Card>
  );
};

export default PositionCard;
