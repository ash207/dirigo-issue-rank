
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import PositionCardMenu from "./PositionCardMenu";
import PositionCardDialogs from "./PositionCardDialogs";
import PositionCardVote from "./PositionCardVote";
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
  
  const isOwner = author_id && currentUserId ? author_id === currentUserId : false;

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
          <PositionCardVote
            id={id}
            title={title}
            isAuthenticated={isAuthenticated}
            isActiveUser={isActiveUser}
            isOwner={isOwner}
            voteCount={voteCount}
            isVoted={isVoted}
            onVote={onVote}
            isVoting={isVoting}
          />
        )}
      </CardFooter>
      
      <PositionCardDialogs
        id={id}
        title={title}
        content={content}
        author_id={author_id}
        issueId={issueId}
        issueTitle={issueTitle}
        isDeleteDialogOpen={isDeleteDialogOpen}
        isEditDialogOpen={isEditDialogOpen}
        isReportDialogOpen={isReportDialogOpen}
        setIsDeleteDialogOpen={setIsDeleteDialogOpen}
        setIsEditDialogOpen={setIsEditDialogOpen}
        setIsReportDialogOpen={setIsReportDialogOpen}
        onPositionUpdated={onPositionUpdated}
      />
    </Card>
  );
};

export default PositionCard;
