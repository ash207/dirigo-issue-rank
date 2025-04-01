
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const usePositionVotes = (issueId: string | undefined, userId: string | undefined, isAuthenticated: boolean) => {
  const [userVotedPosition, setUserVotedPosition] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserVote = async () => {
      if (!isAuthenticated || !userId || !issueId) return;
      
      try {
        const { data, error } = await supabase
          .from('user_votes')
          .select('position_id')
          .eq('user_id', userId)
          .eq('issue_id', issueId)
          .single();
        
        if (error && error.code !== 'PGRST116') { // PGRST116 means no rows returned
          console.error("Error fetching vote:", error);
          return;
        }
        
        if (data) {
          setUserVotedPosition(data.position_id);
        }
      } catch (error) {
        console.error("Error in fetchUserVote:", error);
      }
    };
    
    fetchUserVote();
  }, [isAuthenticated, userId, issueId]);

  const handleVote = async (positionId: string) => {
    if (!isAuthenticated || !userId || !issueId) return;
    
    try {
      if (userVotedPosition) {
        if (userVotedPosition === positionId) {
          // User is trying to unvote - not allowed in this implementation
          toast.info("You can't remove your vote once cast");
          return;
        } else {
          // User is changing their vote
          // First, remove the old vote
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
        
        setUserVotedPosition(positionId);
        toast.success("Your vote has been recorded!");
      }
    } catch (error: any) {
      console.error("Error saving vote:", error);
      toast.error("Failed to save your vote. Please try again.");
    }
  };

  return { userVotedPosition, handleVote };
};

export default usePositionVotes;
