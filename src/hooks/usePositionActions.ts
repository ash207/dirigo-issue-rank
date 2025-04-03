
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const usePositionActions = (userId?: string) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const deletePosition = async (positionId: string, authorId: string) => {
    // Verify ownership
    if (userId !== authorId) {
      toast.error("You don't have permission to delete this position");
      return false;
    }
    
    setIsDeleting(true);
    
    try {
      // Delete votes associated with the position
      const { error: votesError } = await supabase
        .from("user_votes")
        .delete()
        .eq("position_id", positionId);
      
      if (votesError) throw votesError;
      
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

  const updatePosition = async (
    positionId: string, 
    authorId: string, 
    data: { title: string; content: string }
  ) => {
    // Verify ownership
    if (userId !== authorId) {
      toast.error("You don't have permission to edit this position");
      return false;
    }
    
    setIsEditing(true);
    
    try {
      const { error } = await supabase
        .from("positions")
        .update({ 
          title: data.title,
          content: data.content
        })
        .eq("id", positionId);
      
      if (error) throw error;
      
      toast.success("Position updated successfully");
      return true;
    } catch (error: any) {
      console.error("Error updating position:", error);
      toast.error("Failed to update position");
      return false;
    } finally {
      setIsEditing(false);
    }
  };

  return {
    deletePosition,
    updatePosition,
    isDeleting,
    isEditing
  };
};
