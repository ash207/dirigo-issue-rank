
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { isValidUUID } from "./useVoteValidation";

export const useFetchVotes = (issueId: string | undefined, userId: string | undefined, isAuthenticated: boolean) => {
  const [userVotedPosition, setUserVotedPosition] = useState<string | null>(null);
  const [positionVotes, setPositionVotes] = useState<Record<string, number>>({});
  const [isActiveUser, setIsActiveUser] = useState(false);

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
        setPositionVotes(votesMap);
        
        // Only fetch user vote if authenticated
        if (isAuthenticated && userId) {
          // Check if the user has a regular vote with a position_id first
          const { data: userVote, error: userVoteError } = await supabase
            .from('user_votes')
            .select('position_id, privacy_level')
            .eq('user_id', userId)
            .eq('issue_id', issueId)
            .not('position_id', 'is', null)
            .single();
          
          if (userVoteError && userVoteError.code !== 'PGRST116') { // PGRST116 means no rows returned
            console.error("Error fetching user vote:", userVoteError);
          }
          
          if (userVote && userVote.position_id) {
            // User has a standard vote with a position_id
            setUserVotedPosition(userVote.position_id);
          } else {
            // Check if they have a super anonymous vote for this issue
            const { data: superAnonVote, error: superAnonError } = await supabase
              .from('user_votes')
              .select('id, privacy_level')
              .eq('user_id', userId)
              .eq('issue_id', issueId)
              .is('position_id', null)
              .eq('privacy_level', 'super_anonymous')
              .single();
              
            if (superAnonError && superAnonError.code !== 'PGRST116') {
              console.error("Error fetching super anonymous vote:", superAnonError);
            }
            
            // If they have a super anonymous vote, we don't know which position
            // but we know they voted on this issue
            if (superAnonVote) {
              // Since we don't store the position_id, we can't show which position was voted for
              // We need to set userVotedPosition to null and handle this special case in the UI
              setUserVotedPosition(null);
              
              // We could potentially store this information in local storage to persist it across sessions
              // but that would defeat the purpose of super anonymity
            } else {
              // Make sure we clear the user voted position if they don't have a vote
              setUserVotedPosition(null);
            }
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
    setPositionVotes,
    isActiveUser
  };
};
