
import React, { useEffect } from "react";
import { CommandEmpty, CommandGroup, CommandList } from "@/components/ui/command";
import { SearchResultItem } from "./SearchResultItem";
import { type SearchResult } from "@/hooks/useSearch";
import { useAuth } from "@/contexts/AuthContext";

interface SearchResultsProps {
  results: SearchResult[];
  isLoading: boolean;
  onSelectResult: (result: SearchResult) => void;
  searchTerm: string;
}

export const SearchResults = ({ results, isLoading, onSelectResult, searchTerm }: SearchResultsProps) => {
  const { isAuthenticated } = useAuth();
  
  // Debug when component renders with results
  useEffect(() => {
    console.log("SearchResults rendered with", results?.length || 0, "results, isLoading:", isLoading);
  }, [results, isLoading]);
  
  // Ensure results is an array
  const safeResults = Array.isArray(results) ? results : [];
  
  // Group results by type for rendering
  const resultsByType = safeResults.reduce((groups, result) => {
    const type = result.type || 'unknown';
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(result);
    return groups;
  }, {} as Record<string, SearchResult[]>);
  
  const hasResults = safeResults.length > 0;
  const showEmptyState = !hasResults && searchTerm.length >= 2;
  
  // Helper to get human-readable group headings
  const getGroupHeading = (type: string): string => {
    switch (type) {
      case 'issue': return 'Issues';
      case 'user': return 'Users';
      case 'email': return 'Email Results';
      default: return type.charAt(0).toUpperCase() + type.slice(1) + 's';
    }
  };

  return (
    <CommandList className="max-h-[60vh] overflow-y-auto">
      {showEmptyState && (
        <CommandEmpty>
          {isLoading ? (
            <div className="py-6 text-center text-sm">
              <div className="flex justify-center mb-2">
                <div className="animate-spin h-5 w-5 rounded-full border-2 border-primary border-t-transparent"></div>
              </div>
              Searching...
            </div>
          ) : (
            <div className="py-6 text-center text-sm">
              No results found for "{searchTerm}"
            </div>
          )}
        </CommandEmpty>
      )}
      
      {/* Render each result group */}
      {hasResults && Object.entries(resultsByType).map(([type, typeResults]) => (
        <CommandGroup key={type} heading={getGroupHeading(type)}>
          {typeResults.map((result) => (
            <SearchResultItem 
              key={`${result.type}-${result.id}`} 
              result={result} 
              onSelect={onSelectResult} 
            />
          ))}
        </CommandGroup>
      ))}

      {searchTerm.length < 2 && !hasResults && (
        <div className="py-8 text-center text-sm text-muted-foreground">
          Type at least 2 characters to search
        </div>
      )}
    </CommandList>
  );
};
