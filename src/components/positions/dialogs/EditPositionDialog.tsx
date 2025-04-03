
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface EditPositionDialogProps {
  id: string;
  initialContent: string;
  author_id?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPositionUpdated?: () => void;
}

const EditPositionDialog = ({
  id,
  initialContent,
  author_id,
  open,
  onOpenChange,
  onPositionUpdated
}: EditPositionDialogProps) => {
  const [editContent, setEditContent] = useState(initialContent);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEdit = async () => {
    if (!editContent.trim()) {
      toast.error("Position content cannot be empty");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from("positions")
        .update({ content: editContent })
        .eq("id", id)
        .eq("author_id", author_id);
        
      if (error) throw error;
      
      toast.success("Position updated successfully");
      if (onPositionUpdated) onPositionUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating position:", error);
      toast.error("Failed to update position");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button onClick={handleEdit} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditPositionDialog;
