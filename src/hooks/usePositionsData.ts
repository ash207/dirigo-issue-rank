
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const usePositionsData = (id: string | undefined) => {
  return useQuery({
    queryKey: ["positions", id],
    queryFn: async () => {
      if (!id) throw new Error("Issue ID is required");
      
      console.log("Fetching positions for issue:", id);
      
      const { data, error } = await supabase
        .from("positions")
        .select("*")
        .eq("issue_id", id)
        .order("created_at", { ascending: false });
      
      if (error) {
        console.error("Error fetching positions:", error);
        throw error;
      }
      
      console.log("Positions raw data:", data);

      // Transform the data to match the expected format
      const transformedData = await Promise.all(data.map(async position => {
        // Fetch author name if available
        let authorName = "Anonymous";
        if (position.author_id) {
          const { data: authorData, error: authorError } = await supabase
            .from("profiles")
            .select("name")
            .eq("id", position.author_id)
            .single();
          
          if (!authorError && authorData) {
            authorName = authorData.name || "Anonymous";
          }
        }

        return {
          id: position.id,
          title: position.title,
          content: position.content,
          created_at: position.created_at,
          author: {
            name: authorName,
            // Default to basic verification level
            verificationLevel: "basic" as const
          },
          author_id: position.author_id
        };
      }));
      
      console.log("Transformed positions data:", transformedData);
      return transformedData;
    },
    enabled: !!id
  });
};
