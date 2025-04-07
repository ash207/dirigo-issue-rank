
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { isValidUUID } from "./useVoteValidation";

// Define explicit types to avoid deep type instantiation
interface PositionVoteCount {
  position_id: string;
  vote_count: number;
}

// Define the return type explicitly to help TypeScript
interface UseFetchVotesResult {
  userVotedPosition: string | null;
  positionVotes: Record<string, number>;
  setUserVotedPosition: React.Dispatch<React.SetStateAction<string | null>>;
  setPositionVotes: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  isActiveUser: boolean;
  refreshVotes: () => void;
}

export const useFetchVotes = (
  issueId: string | undefined, 
  userId: string | undefined, 
  isAuthenticated: boolean
): UseFetchVotesResult => {
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
        const positionsResult = await supabase
          .from('positions')
          .select('id')
          .eq('issue_id', issueId);
          
        if (positionsResult.error) {
          console.error("Error fetching positions:", positionsResult.error);
          return;
        }
        
        const positions = positionsResult.data;
        
        // Initialize votes map with all positions set to 0 votes
        const votesMap: Record<string, number> = {};
        if (positions) {
          positions.forEach(position => {
            votesMap[position.id] = 0;
          });
        }
        
        // Get vote counts using the RPC function - avoid deep type instantiation
        try {
          // Using any type to completely bypass TypeScript inference
          const { data, error } = await supabase.rpc('get_position_vote_counts', { 
            p_issue_id: issueId 
          });
          
          if (error) {
            console.error("Error fetching vote counts:", error);
          } else if (data) {
            // Process the data as a simple array of objects
            // This avoids TypeScript trying to infer complex nested types
            const voteData = data as Array<{position_id: string, vote_count: number}>;
            
            for (let i = 0; i < voteData.length; i++) {
              const item = voteData[i];
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
            } else if (userVoteResult.data && userVoteResult.data.position_id) {
              setUserVotedPosition(userVoteResult.data.position_id);
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
