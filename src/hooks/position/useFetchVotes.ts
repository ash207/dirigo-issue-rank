
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
        
        console.log("Fetched position votes:", votesMap);
        setPositionVotes(votesMap);
        
        // Only fetch user vote if authenticated
        if (isAuthenticated && userId) {
          // First check regular votes
          const { data: userVote, error: userVoteError } = await supabase
            .from('user_votes')
            .select('position_id')
            .eq('user_id', userId)
            .eq('issue_id', issueId)
            .maybeSingle();
          
          if (userVoteError && userVoteError.code !== 'PGRST116') { // PGRST116 means no rows returned
            console.error("Error fetching user vote:", userVoteError);
            return;
          }
          
          if (userVote) {
            console.log("User voted for position:", userVote.position_id);
            setUserVotedPosition(userVote.position_id);
            return;
          }
          
          // If no regular vote found, check if there's a tracking record for super_anonymous vote
          // Use the edge function instead of direct RPC
          try {
            const { data, error } = await supabase.functions.invoke("check-vote-tracking", {
              body: { user_id: userId, issue_id: issueId }
            });
            
            if (error) {
              console.error("Error invoking check-vote-tracking:", error);
              return;
            }
            
            // Check if vote tracking exists
            if (data && data.exists === true) {
              // We don't know which position was voted for with super_anonymous
              // Local UI will not highlight any position, but unvoting will be possible
              // through the tracking record
              console.log("Super anonymous vote detected but position unknown");
            }
          } catch (error) {
            console.error("Error checking vote tracking:", error);
          }
        }
      } catch (error) {
        console.error("Error in fetchVotes:", error);
      }
    };
    
    fetchVotes();
  }, [isAuthenticated, userId, issueId, lastVoteTime]);

  // Expose a method to force refresh after vote operations
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
