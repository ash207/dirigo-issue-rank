
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { isValidUUID } from "./useVoteValidation";

export const useFetchVotes = (issueId: string | undefined, userId: string | undefined, isAuthenticated: boolean) => {
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

  return {
    userVotedPosition,
    positionVotes,
    setUserVotedPosition,
    setPositionVotes
  };
};
