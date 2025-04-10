
import React from "react";
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
  
  const issueResults = results.filter(result => result.type === "issue");
  const userResults = results.filter(result => result.type === "user");
  const emailResults = results.filter(result => result.type === "email");
  
  const hasResults = results.length > 0;
  const showEmptyState = !hasResults && searchTerm.length >= 2;

  return (
    <CommandList className="max-h-[60vh] overflow-y-auto">
      {showEmptyState && (
        <CommandEmpty>
          {isLoading ? (
            <div className="py-6 text-center text-sm">
              <div className="flex justify-center mb-2">
                <div className="animate-spin h-5 w-5 rounded-full border-2 border-dirigo-blue border-t-transparent"></div>
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
      
      {issueResults.length > 0 && (
        <CommandGroup heading="Issues">
          {issueResults.map((result) => (
            <SearchResultItem 
              key={`${result.type}-${result.id}`} 
              result={result} 
              onSelect={onSelectResult} 
            />
          ))}
        </CommandGroup>
      )}
      
      {userResults.length > 0 && (
        <CommandGroup heading="Users">
          {userResults.map((result) => (
            <SearchResultItem 
              key={`${result.type}-${result.id}`} 
              result={result} 
              onSelect={onSelectResult} 
            />
          ))}
        </CommandGroup>
      )}
      
      {emailResults.length > 0 && (
        <CommandGroup heading="Email Results">
          {emailResults.map((result) => (
            <SearchResultItem 
              key={`${result.type}-${result.id}`} 
              result={result} 
              onSelect={onSelectResult} 
            />
          ))}
        </CommandGroup>
      )}

      {searchTerm.length < 2 && !hasResults && (
        <div className="py-8 text-center text-sm text-muted-foreground">
          Type at least 2 characters to search
        </div>
      )}
    </CommandList>
  );
};
