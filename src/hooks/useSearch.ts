
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
    let isMounted = true;
    const controller = new AbortController();

    const performSearch = async () => {
      // Don't search if term is too short
      if (!debouncedSearchTerm || debouncedSearchTerm.length < 2) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      
      try {
        console.log("Searching for term:", debouncedSearchTerm);
        
        // Batch requests in parallel for better performance
        const searchPromises = [];
        
        // Search for issues
        const issuesPromise = supabase
          .from("issues")
          .select("id, title, category")
          .or(`title.ilike.%${debouncedSearchTerm}%,description.ilike.%${debouncedSearchTerm}%`)
          .limit(5)
          .abortSignal(controller.signal);
        searchPromises.push(issuesPromise);

        // Conditionally add user search if authenticated
        let usersPromise = null;
        let emailSearchPromise = null;
        
        if (isAuthenticated && session?.access_token) {
          // Search for users by name
          usersPromise = supabase
            .from("profiles")
            .select("id, name")
            .ilike("name", `%${debouncedSearchTerm}%`)
            .limit(5)
            .abortSignal(controller.signal);
          searchPromises.push(usersPromise);
          
          // Search for users by email using the edge function
          // Fixed: Removed 'signal' property as it's not supported in FunctionInvokeOptions
          emailSearchPromise = supabase.functions.invoke(
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
          searchPromises.push(emailSearchPromise);
        }

        // Wait for all search requests to complete
        const results = await Promise.all(searchPromises);
        
        if (!isMounted) return;
        
        // Extract results
        const issuesData = results[0].error ? [] : results[0].data || [];
        const usersData = isAuthenticated && results[1] && !results[1].error ? results[1].data || [] : [];
        const emailUsers = isAuthenticated && results[2] && !results[2].error ? results[2].data || [] : [];
        
        console.log("Issues found:", issuesData?.length || 0);
        console.log("Users found by name:", usersData.length);
        console.log("Users found by email:", emailUsers.length);

        // Combine results with a more efficient approach
        const formattedResults: SearchResult[] = [
          ...issuesData.map((issue) => ({
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
        
        if (isMounted) {
          setResults(formattedResults);
        }
      } catch (error) {
        console.error("Search error:", error);
        if (isMounted) {
          toast.error("An error occurred while searching");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    performSearch();

    // Cleanup function
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [debouncedSearchTerm, isAuthenticated, session]);

  return {
    searchTerm,
    setSearchTerm,
    results,
    isLoading
  };
}
