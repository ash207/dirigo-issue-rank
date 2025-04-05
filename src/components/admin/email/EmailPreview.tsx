
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface EmailPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipient: string;
  subject: string;
  content: string;
}

const EmailPreview = ({
  open,
  onOpenChange,
  recipient,
  subject,
  content
}: EmailPreviewProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Email Preview</DialogTitle>
        </DialogHeader>
        <div className="border rounded-md p-4 mt-4">
          <div className="mb-4">
            <strong>To:</strong> {recipient}<br />
            <strong>Subject:</strong> {subject}
          </div>
          <div 
            className="border-t pt-4"
            dangerouslySetInnerHTML={{ __html: content }} 
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EmailPreview;
