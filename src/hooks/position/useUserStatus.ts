
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook to fetch and track a user's account status
 */
export const useUserStatus = (userId: string | undefined, isAuthenticated: boolean) => {
  const [isActiveUser, setIsActiveUser] = useState(false);

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

  return { isActiveUser };
};
