
import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export type SearchResult = {
  id: string;
  type: "issue" | "user" | "email";
  title: string;
  subtitle?: string;
};

export const useSearch = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Function to search for issues
  const searchIssues = async (term: string) => {
    try {
      const { data, error } = await supabase
        .from("issues")
        .select("id, title, description")
        .or(`title.ilike.%${term}%, description.ilike.%${term}%`)
        .limit(5);

      if (error) {
        console.error("Error searching issues:", error);
        return [];
      }

      return data.map((issue) => ({
        id: issue.id,
        type: "issue" as const,
        title: issue.title,
        subtitle: issue.description?.substring(0, 60) + (issue.description?.length > 60 ? "..." : "")
      }));
    } catch (err) {
      console.error("Error in searchIssues:", err);
      return [];
    }
  };

  // Function to search for users by name
  const searchUsersByName = async (term: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, name")
        .ilike("name", `%${term}%`)
        .limit(5);

      if (error) {
        console.error("Error searching users by name:", error);
        return [];
      }

      return data.map((user) => ({
        id: user.id,
        type: "user" as const,
        title: user.name || "Unknown User",
      }));
    } catch (err) {
      console.error("Error in searchUsersByName:", err);
      return [];
    }
  };

  // Function to search for users by email
  const searchUsersByEmail = async (term: string) => {
    try {
      // Note: This requires authenticated users and uses an edge function
      const response = await supabase.functions.invoke("search-users", {
        body: { searchTerm: term },
      });

      if (!response.data) {
        return [];
      }

      return response.data.map((user: any) => ({
        id: user.id,
        type: "email" as const,
        title: user.name || "User",
        subtitle: user.email  // Include the email in the subtitle
      }));
    } catch (err) {
      console.error("Error in searchUsersByEmail:", err);
      return [];
    }
  };

  // Main search function
  const performSearch = useCallback(async () => {
    if (searchTerm.length < 2) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      // Execute searches in parallel
      const [issueResults, userNameResults, userEmailResults] = await Promise.all([
        searchIssues(searchTerm),
        searchUsersByName(searchTerm),
        searchUsersByEmail(searchTerm),
      ]);

      // Combine and set results
      const combinedResults = [...issueResults, ...userNameResults, ...userEmailResults];
      console.log("Issues found:", issueResults.length);
      console.log("Users found by name:", userNameResults.length);
      console.log("Users found by email:", userEmailResults.length);
      console.log("Total combined results:", combinedResults.length);
      
      setResults(combinedResults);
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm]);

  // Trigger search when search term changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.length >= 2) {
        performSearch();
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, performSearch]);

  return {
    searchTerm,
    setSearchTerm,
    results,
    isLoading,
    performSearch
  };
};
