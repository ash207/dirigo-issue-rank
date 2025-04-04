
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { Issue } from "@/types/issue";
import { Position } from "@/types/position";

export const useUserData = () => {
  const { user } = useAuth();
  const userId = user?.id;

  // Fetch user's issues
  const issuesQuery = useQuery({
    queryKey: ["userIssues", userId],
    queryFn: async () => {
      if (!userId) return [];
      
      console.log("Fetching issues for user:", userId);
      
      const { data: issuesData, error: issuesError } = await supabase
        .from("issues")
        .select("*")
        .eq("creator_id", userId)
        .order("created_at", { ascending: false });
      
      if (issuesError) {
        console.error("Error fetching issues:", issuesError);
        throw issuesError;
      }
      
      console.log("Issues data:", issuesData);
      return issuesData as Issue[];
    },
    enabled: !!userId,
  });

  // Fetch user's positions
  const positionsQuery = useQuery({
    queryKey: ["userPositions", userId],
    queryFn: async () => {
      if (!userId) return [];
      
      console.log("Fetching positions for user:", userId);
      
      const { data: positionsData, error: positionsError } = await supabase
        .from("positions")
        .select("*, issues(title)")
        .eq("author_id", userId)
        .order("created_at", { ascending: false });
      
      if (positionsError) {
        console.error("Error fetching positions:", positionsError);
        throw positionsError;
      }
      
      console.log("Positions data:", positionsData);
      return positionsData as Position[];
    },
    enabled: !!userId,
  });

  // Get user profile
  const profileQuery = useQuery({
    queryKey: ["userProfile", userId],
    queryFn: async () => {
      if (!userId) return null;
      
      console.log("Fetching profile for user:", userId);
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*, role")
        .eq("id", userId)
        .single();
      
      if (error) {
        console.error("Error fetching profile:", error);
        throw error;
      }
      
      console.log("Profile data:", data);
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
