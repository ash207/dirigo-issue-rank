
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { isValidUUID } from "./useVoteValidation";

/**
 * Interface for vote count records returned by the RPC function
 */
interface VoteCount {
  position_id: string;
  vote_count: number;
}

/**
 * Custom hook for fetching and managing votes for positions on an issue
 */
export const useFetchVotes = (
  issueId: string | undefined, 
  userId: string | undefined, 
  isAuthenticated: boolean
) => {
  const [userVotedPosition, setUserVotedPosition] = useState<string | null>(null);
  const [positionVotes, setPositionVotes] = useState<Record<string, number>>({});
  const [isActiveUser, setIsActiveUser] = useState(false);
  const [lastVoteTime, setLastVoteTime] = useState(0);

  // Fetch the user's profile status
  useEffect(() => {
    const fetchUserStatus = async () => {
      if (!isAuthenticated || !userId) {
        setIsActiveUser(false);
        return;
      }
      
      try {
        const result = await supabase
          .from('profiles')
          .select('status')
          .eq('id', userId)
          .single();
          
        if (result.error) {
          console.error("Error fetching user status:", result.error);
          setIsActiveUser(false);
          return;
        }
        
        setIsActiveUser(result.data?.status === 'active');
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
        const positionsResult = await supabase
          .from('positions')
          .select('id')
          .eq('issue_id', issueId);
          
        if (positionsResult.error) {
          console.error("Error fetching positions:", positionsResult.error);
          return;
        }
        
        // Initialize votes map with all positions set to 0 votes
        const votesMap: Record<string, number> = {};
        if (positionsResult.data) {
          for (const position of positionsResult.data) {
            votesMap[position.id] = 0;
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
