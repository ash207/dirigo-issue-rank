
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

  // Fetch the user's voted position and all positions' vote counts
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
        
        // Get vote counts for all positions using our custom function
        const { data: voteCounts, error: voteCountsError } = await supabase
          .rpc('get_position_vote_counts', { p_issue_id: issueId });
          
        if (voteCountsError) {
          console.error("Error fetching vote counts:", voteCountsError);
          return;
        }
        
        // Convert to a map for easier use
        const votesMap: Record<string, number> = {};
        positions.forEach(position => {
          const voteData = voteCounts.find(vc => vc.position_id === position.id);
          votesMap[position.id] = voteData ? Number(voteData.vote_count) : 0;
        });
        
        setPositionVotes(votesMap);
        
        // If user is authenticated, fetch their vote
        if (isAuthenticated && userId) {
          const { data: userVote, error: userVoteError } = await supabase
            .from('position_votes')
            .select('position_id')
            .eq('user_id', userId)
            .eq('issue_id', issueId)
            .maybeSingle();
          
          if (userVoteError && userVoteError.code !== 'PGRST116') {
            console.error("Error fetching user vote:", userVoteError);
          } else {
            setUserVotedPosition(userVote?.position_id || null);
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
