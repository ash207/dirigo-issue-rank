
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useUserData = () => {
  const { user } = useAuth();
  const userId = user?.id;

  // Fetch user's issues
  const issuesQuery = useQuery({
    queryKey: ["userIssues", userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data: issuesData, error: issuesError } = await supabase
        .from("issues")
        .select("*")
        .eq("creator_id", userId)
        .order("created_at", { ascending: false });
      
      if (issuesError) throw issuesError;
      
      return issuesData;
    },
    enabled: !!userId,
  });

  // Fetch user's positions
  const positionsQuery = useQuery({
    queryKey: ["userPositions", userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data: positionsData, error: positionsError } = await supabase
        .from("positions")
        .select("*, issues(title)")
        .eq("author_id", userId)
        .order("created_at", { ascending: false });
      
      if (positionsError) throw positionsError;
      
      return positionsData;
    },
    enabled: !!userId,
  });

  // Get user profile
  const profileQuery = useQuery({
    queryKey: ["userProfile", userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*, role")
        .eq("id", userId)
        .single();
      
      if (error) throw error;
      
      return data;
    },
    enabled: !!userId,
  });

  return {
    issues: {
      data: issuesQuery.data || [],
      isLoading: issuesQuery.isLoading,
      error: issuesQuery.error,
    },
    positions: {
      data: positionsQuery.data || [],
      isLoading: positionsQuery.isLoading,
      error: positionsQuery.error,
    },
    profile: {
      data: profileQuery.data || null,
      isLoading: profileQuery.isLoading,
      error: profileQuery.error,
    },
    isLoading: issuesQuery.isLoading || positionsQuery.isLoading || profileQuery.isLoading,
    isError: !!issuesQuery.error || !!positionsQuery.error || !!profileQuery.error,
  };
};
