
import { useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useDebounce } from "@/hooks/useDebounce";

export type SearchResultType = "user" | "issue";

export type SearchResult = {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle?: string;
  priority?: number;
};

export function useUniversalSearch(initialSearchTerm = "") {
  const { isAuthenticated, session } = useAuth();
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const searchRequestRef = useRef<number>(0);

  const performSearch = useCallback(async () => {
    // Don't search if term is too short
    if (!debouncedSearchTerm || debouncedSearchTerm.length < 2) {
      setResults([]);
      setError(null);
      return;
    }

    // Generate a unique ID for this search request to handle race conditions
    const currentSearchId = Date.now();
    searchRequestRef.current = currentSearchId;

    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`Starting universal search for: "${debouncedSearchTerm}"`);
      
      // Always search for issues (public data)
      const issuesPromise = searchIssues(debouncedSearchTerm);
      
      // Conditionally search for users if authenticated
      const usersPromise = isAuthenticated ? searchUsers(debouncedSearchTerm, session?.access_token) : Promise.resolve([]);
      
      // Wait for all search results
      const [issuesResults, usersResults] = await Promise.all([issuesPromise, usersPromise]);
      
      // Check if this search request is still relevant
      if (searchRequestRef.current !== currentSearchId) {
        console.log("Search request abandoned - newer search in progress");
        return;
      }
      
      // Combine and sort all results
      const combinedResults = [...issuesResults, ...usersResults].sort((a, b) => {
        // Sort by priority first (if available)
        if (a.priority !== undefined && b.priority !== undefined) {
          return b.priority - a.priority;
        }
        
        // Then by type (issues first)
        if (a.type !== b.type) {
          return a.type === "issue" ? -1 : 1;
        }
        
        // Then alphabetically by title
        return a.title.localeCompare(b.title);
      });
      
      console.log(`Found ${combinedResults.length} total results`);
      setResults(combinedResults);
    } catch (error: any) {
      console.error("Search error:", error);
      setError("Failed to perform search. Please try again.");
      setResults([]);
    } finally {
      // Only update loading state if this search request is still relevant
      if (searchRequestRef.current === currentSearchId) {
        setIsLoading(false);
      }
    }
  }, [debouncedSearchTerm, isAuthenticated, session]);

  // Search for issues
  const searchIssues = async (term: string): Promise<SearchResult[]> => {
    try {
      const { data, error } = await supabase
        .from("issues")
        .select("id, title, category, created_at")
        .or(`title.ilike.%${term}%,description.ilike.%${term}%`)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      
      console.log(`Found ${data?.length || 0} issues matching "${term}"`);
      
      return (data || []).map(issue => ({
        id: issue.id,
        type: "issue" as const,
        title: issue.title || "Untitled Issue",
        subtitle: `Issue: ${issue.category || "Uncategorized"}`,
        priority: 10 // Higher priority for issues
      }));
    } catch (err) {
      console.error("Error searching issues:", err);
      return [];
    }
  };

  // Search for users - only if authenticated
  const searchUsers = async (term: string, accessToken?: string): Promise<SearchResult[]> => {
    if (!isAuthenticated || !accessToken) {
      return [];
    }
    
    try {
      // Search for users by name first
      const { data: usersByName, error: nameError } = await supabase
        .from("profiles")
        .select("id, name")
        .ilike("name", `%${term}%`)
        .limit(5);
      
      if (nameError) throw nameError;
      
      // Then search for users by email using edge function (requires auth)
      const { data: usersByEmail, error: emailError } = await supabase.functions.invoke(
        "search-users",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          },
          body: {
            searchTerm: term
          }
        }
      );
      
      if (emailError) throw emailError;
      
      console.log(`Found ${usersByName?.length || 0} users by name and ${usersByEmail?.length || 0} users by email`);
      
      // Format name-based results
      const nameResults = (usersByName || []).map(user => ({
        id: user.id,
        type: "user" as const,
        title: user.name || "Unnamed User",
        subtitle: "User Profile",
        priority: 5 // Medium priority
      }));
      
      // Format email-based results
      const emailResults = (usersByEmail || []).map(user => ({
        id: user.id,
        type: "user" as const,
        title: user.name || "Unnamed User",
        subtitle: user.email || "Email User",
        priority: 5 // Medium priority
      }));
      
      // Remove duplicates by id
      const combinedUsers = [...nameResults, ...emailResults];
      const uniqueUsers = Array.from(
        new Map(combinedUsers.map(item => [item.id, item])).values()
      );
      
      return uniqueUsers;
    } catch (err) {
      console.error("Error searching users:", err);
      return [];
    }
  };

  // Search automatically when debounced term changes
  // We already handle this in SearchDialog, so we don't need to duplicate that here
  
  return {
    searchTerm,
    setSearchTerm,
    results,
    isLoading,
    error,
    performSearch,
    hasMinimumSearchLength: searchTerm.length >= 2
  };
}
