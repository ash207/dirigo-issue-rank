
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Helper to check if a string is a valid UUID
const isValidUUID = (str: string | undefined): boolean => {
  if (!str) return false;
  // Basic UUID format validation (simplified)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

export const usePositionVotes = (issueId: string | undefined, userId: string | undefined, isAuthenticated: boolean) => {
  const [userVotedPosition, setUserVotedPosition] = useState<string | null>(null);
  const [positionVotes, setPositionVotes] = useState<Record<string, number>>({});

  // Fetch the user's vote and all position votes
  useEffect(() => {
    const fetchVotes = async () => {
      if (!issueId) return;
      
      // Skip Supabase query if the issueId is not a valid UUID
      if (!isValidUUID(issueId)) {
        console.log("Using mock data for non-UUID issueId:", issueId);
        return;
      }
      
      try {
        // Fetch positions with vote counts
        const { data: positions, error: positionsError } = await supabase
          .from('positions')
          .select('id, votes')
          .eq('issue_id', issueId);
          
        if (positionsError) {
          console.error("Error fetching position votes:", positionsError);
          return;
        }
        
        // Build position votes map
        const votesMap: Record<string, number> = {};
        positions.forEach(position => {
          votesMap[position.id] = position.votes;
        });
        setPositionVotes(votesMap);
        
        // Only fetch user vote if authenticated
        if (isAuthenticated && userId) {
          const { data: userVote, error: userVoteError } = await supabase
            .from('user_votes')
            .select('position_id')
            .eq('user_id', userId)
            .eq('issue_id', issueId)
            .single();
          
          if (userVoteError && userVoteError.code !== 'PGRST116') { // PGRST116 means no rows returned
            console.error("Error fetching user vote:", userVoteError);
            return;
          }
          
          if (userVote) {
            setUserVotedPosition(userVote.position_id);
          }
        }
      } catch (error) {
        console.error("Error in fetchVotes:", error);
      }
    };
    
    fetchVotes();
  }, [isAuthenticated, userId, issueId]);

  const updatePositionVote = (positionId: string, newCount: number) => {
    setPositionVotes(prev => ({
      ...prev,
      [positionId]: newCount
    }));
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

  return { userVotedPosition, positionVotes, handleVote };
};

export default usePositionVotes;
