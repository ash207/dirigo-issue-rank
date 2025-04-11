
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef, KeyboardEvent } from "react";
import { Search } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";

import { useUniversalSearch, type SearchResult } from "@/hooks/useUniversalSearch";

export const SearchDialog = ({ open, setOpen }: { open: boolean; setOpen: (open: boolean) => void }) => {
  const navigate = useNavigate();
  const { 
    searchTerm, 
    setSearchTerm, 
    results, 
    isLoading, 
    error,
    performSearch,
    hasMinimumSearchLength
  } = useUniversalSearch();
  
  const inputRef = useRef<HTMLInputElement>(null);
  const [activeItemIndex, setActiveItemIndex] = useState(-1);
  
  // Focus input when dialog opens
  useEffect(() => {
    if (open) {
      // Short delay to ensure the input is in the DOM
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      
      // Reset active item
      setActiveItemIndex(-1);
    }
  }, [open]);
  
  // Perform search when dialog opens with existing term
  useEffect(() => {
    if (open && hasMinimumSearchLength) {
      performSearch();
    }
  }, [open, hasMinimumSearchLength, performSearch]);
  
  // Handle navigation to selected result
  const handleSelect = (result: SearchResult) => {
    if (result.type === "issue") {
      navigate(`/issues/${result.id}`);
    } else if (result.type === "user") {
      navigate(`/profile/${result.id}`);
    }
    setOpen(false);
    setSearchTerm(""); // Clear search term after navigation
  };
  
  // Handle keyboard navigation
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!results.length) return;
    
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveItemIndex(prev => 
          prev < results.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveItemIndex(prev => 
          prev > 0 ? prev - 1 : results.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (activeItemIndex >= 0 && activeItemIndex < results.length) {
          handleSelect(results[activeItemIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setOpen(false);
        break;
    }
  };

  // Group results by type for better organization
  const groupedResults = results.reduce((groups, result) => {
    const type = result.type;
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(result);
    return groups;
  }, {} as Record<string, SearchResult[]>);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent 
        className="sm:max-w-[500px] p-0 overflow-hidden"
        onKeyDown={handleKeyDown}
      >
        <DialogHeader className="px-4 pt-4">
          <DialogTitle>Universal Search</DialogTitle>
          <DialogDescription>
            Search for issues, users, and more
          </DialogDescription>
        </DialogHeader>
        
        <Command className="rounded-lg border shadow-md">
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <CommandInput
              ref={inputRef}
              placeholder="Search for anything..."
              value={searchTerm}
              onValueChange={setSearchTerm}
              className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          
          <CommandList className="max-h-[60vh] overflow-y-auto">
            {/* Show loading state */}
            {isLoading && searchTerm.length >= 2 && (
              <CommandEmpty>
                <div className="py-6 text-center text-sm">
                  <div className="flex justify-center mb-2">
                    <div className="animate-spin h-5 w-5 rounded-full border-2 border-primary border-t-transparent"></div>
                  </div>
                  Searching...
                </div>
              </CommandEmpty>
            )}
            
            {/* Show empty state */}
            {!isLoading && results.length === 0 && searchTerm.length >= 2 && (
              <CommandEmpty>
                <div className="py-6 text-center text-sm">
                  {error ? (
                    <div className="text-destructive">{error}</div>
                  ) : (
                    <div>No results found for "{searchTerm}"</div>
                  )}
                </div>
              </CommandEmpty>
            )}
            
            {/* Instructions when search term is too short */}
            {searchTerm.length < 2 && (
              <div className="py-8 text-center text-sm text-muted-foreground">
                Type at least 2 characters to search
              </div>
            )}
            
            {/* Display grouped results */}
            {Object.entries(groupedResults).map(([type, typeResults]) => (
              <CommandGroup key={type} heading={type === "issue" ? "Issues" : "Users"}>
                {typeResults.map((result, index) => (
                  <CommandItem
                    key={`${result.type}-${result.id}`}
                    onSelect={() => handleSelect(result)}
                    className={`flex items-center gap-2 px-4 py-2 cursor-pointer ${
                      index === activeItemIndex ? "bg-accent text-accent-foreground" : ""
                    }`}
                  >
                    {result.type === "issue" ? (
                      <div className="h-4 w-4 text-muted-foreground">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" y1="8" x2="12" y2="12" />
                          <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                      </div>
                    ) : (
                      <div className="h-4 w-4 text-muted-foreground">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="7" r="4" />
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        </svg>
                      </div>
                    )}
                    <div className="flex flex-col flex-1 truncate">
                      <span className="font-medium">{result.title}</span>
                      {result.subtitle && (
                        <span className="text-xs text-muted-foreground truncate">{result.subtitle}</span>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
};
