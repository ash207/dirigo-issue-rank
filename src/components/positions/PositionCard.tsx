
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PositionCardMenu from "./PositionCardMenu";
import PositionVoteButton from "./PositionVoteButton";
import DeletePositionDialog from "./dialogs/DeletePositionDialog";
import EditPositionDialog from "./dialogs/EditPositionDialog";
import ReportPositionDialog from "./dialogs/ReportPositionDialog";
import { VotePrivacyLevel } from "./dialogs/VotePrivacyDialog";

interface PositionCardProps {
  id: string;
  title: string;
  content: string;
  author: {
    name: string;
    verificationLevel: "unverified" | "basic" | "voter" | "official";
  };
  votes: number;
  userVotedPosition: string | null;
  onVote: (positionId: string, privacyLevel?: VotePrivacyLevel) => void;
  isAuthenticated: boolean;
  isActiveUser?: boolean;
  currentUserId?: string;
  author_id?: string;
  onPositionUpdated?: () => void;
  issueId?: string;
  issueTitle?: string;
}

const PositionCard = ({
  id,
  title,
  content,
  author,
  votes,
  userVotedPosition,
  onVote,
  isAuthenticated,
  isActiveUser = true,
  author_id,
  currentUserId,
  onPositionUpdated,
  issueId,
  issueTitle = "this issue"
}: PositionCardProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  
  // Check if current user is the author of this position
  const isOwner = author_id && currentUserId && author_id === currentUserId;

  // Handle vote with privacy
  const handleVote = (privacyLevel?: VotePrivacyLevel) => {
    onVote(id, privacyLevel);
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
        
        <div className="flex justify-between items-center">
          <PositionVoteButton
            votes={votes}
            userVoted={userVotedPosition === id}
            onVote={handleVote}
            isActiveUser={isActiveUser}
            isAuthenticated={isAuthenticated}
            positionTitle={title}
          />
        </div>
      </CardContent>
      
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
    </Card>
  );
};

export default PositionCard;
