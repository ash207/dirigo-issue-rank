
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { isValidUUID } from "./useVoteValidation";

export const useFetchVotes = (issueId: string | undefined, userId: string | undefined, isAuthenticated: boolean) => {
  const [userVotedPosition, setUserVotedPosition] = useState<string | null>(null);
  const [positionVotes, setPositionVotes] = useState<Record<string, number>>({});
  const [isActiveUser, setIsActiveUser] = useState(false);
  const [lastVoteTime, setLastVoteTime] = useState<number>(0);

  // Fetch the user's profile status
  useEffect(() => {
    const fetchUserStatus = async () => {
      if (!isAuthenticated || !userId) {
        setIsActiveUser(false);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('status')
          .eq('id', userId)
          .single();
          
        if (error) {
          console.error("Error fetching user status:", error);
          setIsActiveUser(false);
          return;
        }
        
        setIsActiveUser(data.status === 'active');
      } catch (error) {
        console.error("Error in fetchUserStatus:", error);
        setIsActiveUser(false);
      }
    };
    
    fetchUserStatus();
  }, [isAuthenticated, userId]);

  // Fetch votes data
  useEffect(() => {
    const fetchVoteData = async () => {
      if (!issueId) return;
      
      // Skip Supabase query if the issueId is not a valid UUID
      if (!isValidUUID(issueId)) {
        console.log("Using mock data for non-UUID issueId:", issueId);
        return;
      }
      
      try {
        // Get all positions for this issue
        const { data: positions, error: positionsError } = await supabase
          .from('positions')
          .select('id')
          .eq('issue_id', issueId);
          
        if (positionsError) {
          console.error("Error fetching positions:", positionsError);
          return;
        }
        
        // Initialize votes map with all positions set to 0 votes
        const votesMap: Record<string, number> = {};
        if (positions) {
          positions.forEach(position => {
            votesMap[position.id] = 0;
          });
        }
        
        // Get vote counts using the RPC function
        try {
          // Explicitly type the RPC response to avoid deep type instantiation
          type VoteCountItem = { position_id: string; vote_count: number };
          
          const { data, error } = await supabase
            .rpc('get_position_vote_counts', { p_issue_id: issueId });
            
          if (error) {
            console.error("Error fetching vote counts:", error);
          } else if (data) {
            // Safely process the data with explicit typing
            (data as VoteCountItem[]).forEach(item => {
              if (item && item.position_id && typeof item.vote_count === 'number') {
                votesMap[item.position_id] = item.vote_count;
              }
            });
          }
        } catch (error) {
          console.error("Error in vote counts RPC:", error);
        }
        
        setPositionVotes(votesMap);
        
        // If user is authenticated, fetch their vote
        if (isAuthenticated && userId) {
          try {
            const { data: userVote, error: userVoteError } = await supabase
              .from('position_votes')
              .select('position_id')
              .eq('user_id', userId)
              .eq('issue_id', issueId)
              .maybeSingle();
            
            if (userVoteError) {
              console.error("Error fetching user vote:", userVoteError);
            } else if (userVote && userVote.position_id) {
              setUserVotedPosition(userVote.position_id);
            } else {
              setUserVotedPosition(null);
            }
          } catch (error) {
            console.error("Error fetching user vote:", error);
          }
        }
      } catch (error) {
        console.error("Error in fetchVoteData:", error);
      }
    };
    
    fetchVoteData();
  }, [issueId, userId, isAuthenticated, lastVoteTime]);

  // Expose a method to force refresh vote data
  const refreshVotes = () => {
    setLastVoteTime(Date.now());
  };

  return {
    userVotedPosition,
    positionVotes,
    setUserVotedPosition,
    setPositionVotes,
    isActiveUser,
    refreshVotes
  };
};
