
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { isValidUUID } from "./useVoteValidation";

export const useVoteHandler = (
  issueId: string | undefined, 
  userId: string | undefined, 
  isAuthenticated: boolean, 
  userVotedPosition: string | null,
  setUserVotedPosition: (positionId: string | null) => void,
  positionVotes: Record<string, number>,
  setPositionVotes: (votes: Record<string, number>) => void
) => {
  const updatePositionVote = (positionId: string, newCount: number) => {
    setPositionVotes({
      ...positionVotes,
      [positionId]: newCount
    });
  };

  const handleVote = async (positionId: string) => {
    if (!isAuthenticated || !userId || !issueId) return;
    
    // For mock data with non-UUID IDs, simulate voting without database calls
    if (!isValidUUID(issueId) || !isValidUUID(positionId)) {
      console.log("Using mock voting for non-UUID IDs", { issueId, positionId });
      setUserVotedPosition(positionId);
      toast.success("Your vote has been recorded! (Mock)");
      return;
    }
    
    try {
      if (userVotedPosition) {
        if (userVotedPosition === positionId) {
          // User is trying to unvote - not allowed in this implementation
          toast.info("You can't remove your vote once cast");
          return;
        } else {
          // User is changing their vote
          // First, remove the old vote by decrementing the count
          const { data: oldPosition } = await supabase
            .from('positions')
            .select('votes')
            .eq('id', userVotedPosition)
            .single();
            
          if (oldPosition) {
            const newCount = Math.max(0, oldPosition.votes - 1);
            await supabase
              .from('positions')
              .update({ votes: newCount })
              .eq('id', userVotedPosition);
            
            // Update local state for the old position
            updatePositionVote(userVotedPosition, newCount);
          }
          
          // Delete the old vote record
          await supabase
            .from('user_votes')
            .delete()
            .eq('user_id', userId)
            .eq('issue_id', issueId);
          
          // Then add the new vote
          const { error } = await supabase
            .from('user_votes')
            .insert({
              user_id: userId,
              issue_id: issueId,
              position_id: positionId,
            });
          
          if (error) throw error;
          
          // Increment the vote count on the new position
          const { data: newPosition } = await supabase
            .from('positions')
            .select('votes')
            .eq('id', positionId)
            .single();
            
          if (newPosition) {
            const newCount = newPosition.votes + 1;
            await supabase
              .from('positions')
              .update({ votes: newCount })
              .eq('id', positionId);
            
            // Update local state for the new position
            updatePositionVote(positionId, newCount);
          }
          
          setUserVotedPosition(positionId);
          toast.success("Your vote has been updated!");
        }
      } else {
        // User is voting for the first time
        const { error } = await supabase
          .from('user_votes')
          .insert({
            user_id: userId,
            issue_id: issueId,
            position_id: positionId,
          });
        
        if (error) throw error;
        
        // Increment the vote count
        const { data: position } = await supabase
          .from('positions')
          .select('votes')
          .eq('id', positionId)
          .single();
          
        if (position) {
          const newCount = position.votes + 1;
          await supabase
            .from('positions')
            .update({ votes: newCount })
            .eq('id', positionId);
          
          // Update local state
          updatePositionVote(positionId, newCount);
        }
        
        setUserVotedPosition(positionId);
        toast.success("Your vote has been recorded!");
      }
    } catch (error: any) {
      console.error("Error saving vote:", error);
      toast.error("Failed to save your vote. Please try again.");
    }
  };

  return {
    handleVote
  };
};
