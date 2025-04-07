
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

  // Fetch the positions for the issue
  useEffect(() => {
    const fetchPositions = async () => {
      if (!issueId) return;
      
      // Skip Supabase query if the issueId is not a valid UUID
      if (!isValidUUID(issueId)) {
        console.log("Using mock data for non-UUID issueId:", issueId);
        return;
      }
      
      try {
        // Fetch positions
        const { data: positions, error: positionsError } = await supabase
          .from('positions')
          .select('id')
          .eq('issue_id', issueId);
          
        if (positionsError) {
          console.error("Error fetching positions:", positionsError);
          return;
        }
        
        // Build position votes map (all positions have 0 votes since voting is removed)
        const votesMap: Record<string, number> = {};
        positions.forEach(position => {
          votesMap[position.id] = 0;
        });
        
        console.log("Fetched positions:", votesMap);
        setPositionVotes(votesMap);
      } catch (error) {
        console.error("Error in fetchPositions:", error);
      }
    };
    
    fetchPositions();
  }, [issueId, lastVoteTime]);

  // Expose a method to force refresh position list
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
