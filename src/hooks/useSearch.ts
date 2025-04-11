
import { useState, useEffect, useCallback, useRef } from "react";
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
  const searchRequestRef = useRef<number>(0);

  const performSearch = useCallback(async () => {
    // Don't search if term is too short
    if (!debouncedSearchTerm || debouncedSearchTerm.length < 2) {
      setResults([]);
      return;
    }

    // Generate a unique ID for this search request
    const currentSearchId = Date.now();
    searchRequestRef.current = currentSearchId;

    setIsLoading(true);
    
    try {
      console.log("Searching for term:", debouncedSearchTerm, "requestId:", currentSearchId);
      
      // Batch requests in parallel for better performance
      const searchPromises = [];
      
      // Search for issues
      const issuesPromise = supabase
        .from("issues")
        .select("id, title, category")
        .or(`title.ilike.%${debouncedSearchTerm}%,description.ilike.%${debouncedSearchTerm}%`)
        .limit(5);
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
          .limit(5);
        searchPromises.push(usersPromise);
        
        // Search for users by email using the edge function
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
      
      // Check if this search request is still relevant
      if (searchRequestRef.current !== currentSearchId) {
        console.log("Search request", currentSearchId, "abandoned - newer search in progress");
        return;
      }
      
      // Extract results
      const issuesData = results[0]?.error ? [] : results[0]?.data || [];
      const usersData = isAuthenticated && results[1] && !results[1].error ? results[1]?.data || [] : [];
      // Email search results come from the edge function
      const emailUsers = isAuthenticated && results[2] && !results[2].error ? results[2]?.data || [] : [];
      
      console.log("Issues found:", issuesData?.length || 0);
      console.log("Users found by name:", usersData?.length || 0);
      console.log("Users found by email:", emailUsers?.length || 0);

      // Initialize formattedResults as an empty array to avoid undefined
      const formattedResults: SearchResult[] = [];
      
      // Add issues to results (with null checks)
      if (Array.isArray(issuesData)) {
        issuesData.forEach(issue => {
          formattedResults.push({
            id: issue.id,
            type: "issue" as const,
            title: issue.title,
            subtitle: `Issue: ${issue.category}`
          });
        });
      }
      
      // Add users found by name to results (with null checks)
      if (Array.isArray(usersData)) {
        usersData.forEach(user => {
          formattedResults.push({
            id: user.id,
            type: "user" as const,
            title: user.name || "Unnamed User",
            subtitle: "User Profile"
          });
        });
      }
      
      // Add users found by email to results (with null checks)
      if (Array.isArray(emailUsers)) {
        emailUsers.forEach(user => {
          formattedResults.push({
            id: user.id,
            type: "email" as const,
            title: user.name || "Unnamed User",
            subtitle: user.email // Make sure the email is included in the subtitle
          });
        });
      }

      console.log("Total combined results:", formattedResults.length);
      
      // Always set results to an array (even if empty)
      setResults(formattedResults);
    } catch (error) {
      console.error("Search error:", error);
      toast.error("An error occurred while searching");
      // Ensure we set results to an empty array on error
      setResults([]);
    } finally {
      // Only update loading state if this search request is still relevant
      if (searchRequestRef.current === currentSearchId) {
        setIsLoading(false);
      }
    }
  }, [debouncedSearchTerm, isAuthenticated, session]);

  // Automatically perform search when debounced search term changes
  useEffect(() => {
    if (debouncedSearchTerm.length >= 2) {
      performSearch();
    } else {
      setResults([]);
    }
  }, [debouncedSearchTerm, performSearch]);

  return {
    searchTerm,
    setSearchTerm,
    results,
    isLoading,
    performSearch // Export this function so it can be called manually
  };
}
