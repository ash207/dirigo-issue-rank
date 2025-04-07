
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const useDeletePosition = (userId?: string) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const deletePosition = async (positionId: string, authorId: string) => {
    // Verify ownership
    if (userId !== authorId) {
      toast.error("You don't have permission to delete this position");
      return false;
    }
    
    setIsDeleting(true);
    
    try {
      // Delete the position
      const { error } = await supabase
        .from("positions")
        .delete()
        .eq("id", positionId);
      
      if (error) throw error;
      
      toast.success("Position deleted successfully");
      return true;
    } catch (error: any) {
      console.error("Error deleting position:", error);
      toast.error("Failed to delete position");
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    deletePosition,
    isDeleting
  };
};
