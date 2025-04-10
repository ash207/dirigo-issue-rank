
import React from "react";
import { CommandEmpty, CommandGroup, CommandList } from "@/components/ui/command";
import { SearchResultItem } from "./SearchResultItem";
import { type SearchResult } from "@/hooks/useSearch";
import { useAuth } from "@/contexts/AuthContext";

interface SearchResultsProps {
  results: SearchResult[];
  isLoading: boolean;
  onSelectResult: (result: SearchResult) => void;
}

export const SearchResults = ({ results, isLoading, onSelectResult }: SearchResultsProps) => {
  const { isAuthenticated } = useAuth();
  
  const issueResults = results.filter(result => result.type === "issue");
  const userResults = results.filter(result => result.type === "user");
  const emailResults = results.filter(result => result.type === "email");
  
  const hasResults = issueResults.length > 0 || userResults.length > 0 || emailResults.length > 0;

  return (
    <CommandList>
      {!hasResults && (
        <CommandEmpty>
          {isLoading ? (
            <div className="py-6 text-center text-sm">Loading...</div>
          ) : (
            <div className="py-6 text-center text-sm">No results found.</div>
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
      
      {isAuthenticated && userResults.length > 0 && (
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
      
      {isAuthenticated && emailResults.length > 0 && (
        <CommandGroup heading="Email Search">
          {emailResults.map((result) => (
            <SearchResultItem 
              key={`${result.type}-${result.id}`} 
              result={result} 
              onSelect={onSelectResult} 
            />
          ))}
        </CommandGroup>
      )}
    </CommandList>
  );
};
