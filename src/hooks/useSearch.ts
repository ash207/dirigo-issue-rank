
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useDebounce } from "@/hooks/useDebounce";
import { toast } from "sonner";

export type SearchResult = {
  id: string;
  type: "user" | "issue" | "email";
  title: string;
  subtitle?: string;
};

export function useSearch(initialSearchTerm = "") {
  const { isAuthenticated, session } = useAuth();
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedSearchTerm || debouncedSearchTerm.length < 2) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      
      try {
        console.log("Searching for term:", debouncedSearchTerm);
        
        // Search for issues
        const { data: issuesData, error: issuesError } = await supabase
          .from("issues")
          .select("id, title, category")
          .or(`title.ilike.%${debouncedSearchTerm}%,description.ilike.%${debouncedSearchTerm}%`)
          .limit(5);

        if (issuesError) throw issuesError;
        console.log("Issues found:", issuesData?.length || 0);

        // If authenticated, also search for users by name and by email
        let usersData: any[] = [];
        let emailUsers: any[] = [];
        
        if (isAuthenticated && session?.access_token) {
          // Search for users by name
          const { data: userData, error: userError } = await supabase
            .from("profiles")
            .select("id, name")
            .ilike("name", `%${debouncedSearchTerm}%`)
            .limit(5);

          if (userError) throw userError;
          usersData = userData || [];
          console.log("Users found by name:", usersData.length);
          
          // Search for users by email using the edge function
          try {
            console.log("Searching for users by email");
            const { data: emailUserData, error: emailUserError } = await supabase.functions.invoke(
              "search-users",
              {
                headers: {
                  Authorization: `Bearer ${session.access_token}`
                },
                body: {
                  searchTerm: debouncedSearchTerm
                }
              }
            );
            
            if (emailUserError) {
              console.error("Email search error:", emailUserError);
              throw emailUserError;
            }
            
            emailUsers = emailUserData || [];
            console.log("Users found by email:", emailUsers.length);
          } catch (error) {
            console.error("Error searching users by email:", error);
            toast.error("Error searching by email. Please try again.");
          }
        }

        // Combine results
        const formattedResults: SearchResult[] = [
          ...(issuesData || []).map((issue) => ({
            id: issue.id,
            type: "issue" as const,
            title: issue.title,
            subtitle: `Issue: ${issue.category}`
          })),
          ...usersData.map((user) => ({
            id: user.id,
            type: "user" as const,
            title: user.name || "Unnamed User",
            subtitle: "User Profile"
          })),
          ...emailUsers.map((user) => ({
            id: user.id,
            type: "email" as const,
            title: user.name || "Unnamed User",
            subtitle: user.email
          }))
        ];

        console.log("Total combined results:", formattedResults.length);
        setResults(formattedResults);
      } catch (error) {
        console.error("Search error:", error);
        toast.error("An error occurred while searching");
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
  }, [debouncedSearchTerm, isAuthenticated, session]);

  return {
    searchTerm,
    setSearchTerm,
    results,
    isLoading
  };
}
