
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const useIssueActions = (userId?: string) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  const deleteIssue = async (issueId: string, creatorId: string) => {
    // Verify ownership
    if (userId !== creatorId) {
      toast.error("You don't have permission to delete this issue");
      return false;
    }
    
    setIsDeleting(true);
    
    try {
      // Delete positions related to the issue first
      const { error: positionsError } = await supabase
        .from("positions")
        .delete()
        .eq("issue_id", issueId);
      
      if (positionsError) throw positionsError;
      
      // Delete the issue itself
      const { error } = await supabase
        .from("issues")
        .delete()
        .eq("id", issueId);
      
      if (error) throw error;
      
      toast.success("Issue deleted successfully");
      navigate("/issues");
      return true;
    } catch (error: any) {
      console.error("Error deleting issue:", error);
      toast.error("Failed to delete issue");
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    deleteIssue,
    isDeleting
  };
};
