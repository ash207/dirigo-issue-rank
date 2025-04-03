
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useIssueData = (id: string | undefined) => {
  return useQuery({
    queryKey: ["issue", id],
    queryFn: async () => {
      if (!id) throw new Error("Issue ID is required");
      
      const { data, error } = await supabase
        .from("issues")
        .select("*")
        .eq("id", id)
        .single();
      
      if (error) throw error;

      // Fetch creator name if available
      let creatorName = "Anonymous";
      if (data.creator_id) {
        const { data: creatorData, error: creatorError } = await supabase
          .from("profiles")
          .select("name")
          .eq("id", data.creator_id)
          .single();
        
        if (!creatorError && creatorData) {
          creatorName = creatorData.name || "Anonymous";
        }
      }
      
      // Ensure we have a scope value
      return {
        ...data,
        creatorName,
        scope: data.scope || "state" // Default to state if not specified
      };
    },
    enabled: !!id,
  });
};
