
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const useUpdatePosition = (userId?: string) => {
  const [isEditing, setIsEditing] = useState(false);

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
    updatePosition,
    isEditing
  };
};
