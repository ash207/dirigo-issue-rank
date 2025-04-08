
import DeletePositionDialog from "./dialogs/DeletePositionDialog";
import EditPositionDialog from "./dialogs/EditPositionDialog";
import ReportPositionDialog from "./dialogs/ReportPositionDialog";

interface PositionCardDialogsProps {
  id: string;
  title: string;
  content: string;
  author_id?: string;
  issueId?: string;
  issueTitle?: string;
  isDeleteDialogOpen: boolean;
  isEditDialogOpen: boolean;
  isReportDialogOpen: boolean;
  setIsDeleteDialogOpen: (open: boolean) => void;
  setIsEditDialogOpen: (open: boolean) => void;
  setIsReportDialogOpen: (open: boolean) => void;
  onPositionUpdated?: () => void;
}

const PositionCardDialogs = ({
  id,
  title,
  content,
  author_id,
  issueId,
  issueTitle = "this issue",
  isDeleteDialogOpen,
  isEditDialogOpen,
  isReportDialogOpen,
  setIsDeleteDialogOpen,
  setIsEditDialogOpen,
  setIsReportDialogOpen,
  onPositionUpdated
}: PositionCardDialogsProps) => {
  return (
    <>
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
    </>
  );
};

export default PositionCardDialogs;
