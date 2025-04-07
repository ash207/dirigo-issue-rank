
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Helper to update the local state for position votes
export const updatePositionVote = (
  positionId: string, 
  newCount: number,
  setPositionVotes: React.Dispatch<React.SetStateAction<Record<string, number>>>
) => {
  console.log(`Updating vote count for position ${positionId} to ${newCount}`);
  setPositionVotes((prevVotes) => ({
    ...prevVotes,
    [positionId]: newCount
  }));
};

// Update position vote count in the database and return the new count
export const updatePositionVoteCount = async (
  positionId: string,
  newCount: number
): Promise<number> => {
  // Ensure count doesn't go below zero
  const safeCount = Math.max(0, newCount);
  
  const { data, error } = await supabase
    .from('positions')
    .update({ votes: safeCount })
    .eq('id', positionId)
    .select('votes')
    .single();
    
  if (error) {
    console.error(`Error updating vote count for position ${positionId}:`, error);
    throw error;
  }
  
  console.log(`Updated vote count for position ${positionId} to ${data.votes}`);
  return data.votes;
};

// Get current vote count for a position
export const getPositionVoteCount = async (positionId: string): Promise<number> => {
  const { data, error } = await supabase
    .from('positions')
    .select('votes')
    .eq('id', positionId)
    .single();
    
  if (error) {
    console.error(`Error fetching vote count for position ${positionId}:`, error);
    throw error;
  }
  
  return data.votes;
};
