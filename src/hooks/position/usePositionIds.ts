
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { isValidUUID } from "./useVoteValidation";

/**
 * Hook to fetch position IDs for a given issue
 */
export const usePositionIds = (issueId: string | undefined, refreshTrigger: number) => {
  const [positionIds, setPositionIds] = useState<string[]>([]);

  useEffect(() => {
    const fetchPositions = async () => {
      if (!issueId || !isValidUUID(issueId)) {
        setPositionIds([]);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('positions')
          .select('id')
          .eq('issue_id', issueId);
          
        if (error) {
          console.error("Error fetching positions:", error);
          return;
        }
        
        if (data) {
          const ids = data.map(position => position.id);
          setPositionIds(ids);
          console.log("Fetched position IDs:", ids);
        }
      } catch (error) {
        console.error("Error in fetchPositions:", error);
      }
    };
    
    fetchPositions();
  }, [issueId, refreshTrigger]);

  return { positionIds };
};
