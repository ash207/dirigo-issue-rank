
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type UserProfileData = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  status: string;
  created_at: string;
  email_confirmed_at: string | null;
  issues?: any[];
  positions?: any[];
};

export const useUserProfileData = (userId: string | undefined) => {
  const { session } = useAuth();
  const isAdmin = session?.user?.id === userId;

  // Fetch user profile
  const profileQuery = useQuery({
    queryKey: ["userProfile", userId],
    queryFn: async () => {
      if (!userId) return null;
      
      // If admin, use edge function to get complete user data
      if (isAdmin) {
        const { data, error } = await supabase.functions.invoke("lookup-user", {
          headers: {
            Authorization: `Bearer ${session?.access_token}`
          },
          body: {
            userId
          }
        });
        
        if (error) throw error;
        return data;
      }
      
      // For non-admin, use regular profile lookup
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      
      if (error) throw error;
      
      return data;
    },
    enabled: !!userId,
  });

  // Fetch user's issues
  const issuesQuery = useQuery({
    queryKey: ["userProfileIssues", userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data: issuesData, error: issuesError } = await supabase
        .from("issues")
        .select("*")
        .eq("creator_id", userId)
        .order("created_at", { ascending: false });
      
      if (issuesError) throw issuesError;
      
      return issuesData || [];
    },
    enabled: !!userId,
  });

  // Fetch user's positions
  const positionsQuery = useQuery({
    queryKey: ["userProfilePositions", userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data: positionsData, error: positionsError } = await supabase
        .from("positions")
        .select("*, issues(title)")
        .eq("author_id", userId)
        .order("created_at", { ascending: false });
      
      if (positionsError) throw positionsError;
      
      return positionsData || [];
    },
    enabled: !!userId,
  });

  return {
    profile: {
      data: profileQuery.data,
      isLoading: profileQuery.isLoading,
      error: profileQuery.error,
    },
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
    isLoading: profileQuery.isLoading || issuesQuery.isLoading || positionsQuery.isLoading,
    isError: !!profileQuery.error || !!issuesQuery.error || !!positionsQuery.error,
  };
};
