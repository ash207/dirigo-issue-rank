
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { isValidUUID } from "./useVoteValidation";

/**
 * Hook to fetch position vote counts and user vote status
 */
export const usePositionVotesData = (
  issueId: string | undefined, 
  userId: string | undefined, 
  isAuthenticated: boolean,
  positionIds: string[],
  refreshTrigger: number
) => {
  const [positionVotes, setPositionVotes] = useState<Record<string, number>>({});
  const [userVotedPosition, setUserVotedPosition] = useState<string | null>(null);

  useEffect(() => {
    const fetchVoteData = async () => {
      if (!issueId) return;
      
      // Skip Supabase query if the issueId is not a valid UUID
      if (!isValidUUID(issueId)) {
        console.log("Using mock data for non-UUID issueId:", issueId);
        return;
      }
      
      try {
        // Initialize votes map with all positions set to 0 votes
        const votesMap: Record<string, number> = {};
        if (positionIds.length > 0) {
          for (const positionId of positionIds) {
            votesMap[positionId] = 0;
          }
        }
        
        // Get vote counts using the RPC function with explicit typing
        try {
          const { data, error } = await supabase.rpc('get_position_vote_counts', { 
            p_issue_id: issueId 
          });
          
          if (error) {
            console.error("Error fetching vote counts:", error);
          } else if (data) {
            // Process data with known structure
            for (const item of data) {
              if (item && typeof item.position_id === 'string' && typeof item.vote_count === 'number') {
                votesMap[item.position_id] = item.vote_count;
              }
            }
          }
        } catch (error) {
          console.error("Error in vote counts RPC:", error);
        }
        
        setPositionVotes(votesMap);
        
        // If user is authenticated, fetch their vote
        if (isAuthenticated && userId) {
          try {
            const userVoteResult = await supabase
              .from('position_votes')
              .select('position_id')
              .eq('user_id', userId)
              .eq('issue_id', issueId)
              .maybeSingle();
            
            if (userVoteResult.error) {
              console.error("Error fetching user vote:", userVoteResult.error);
              setUserVotedPosition(null);
            } else {
              setUserVotedPosition(userVoteResult.data?.position_id || null);
            }
          } catch (error) {
            console.error("Error fetching user vote:", error);
            setUserVotedPosition(null);
          }
        }
      } catch (error) {
        console.error("Error in fetchVoteData:", error);
      }
    };
    
    fetchVoteData();
  }, [issueId, userId, isAuthenticated, refreshTrigger, positionIds]);

  return { positionVotes, userVotedPosition, setUserVotedPosition, setPositionVotes };
};
