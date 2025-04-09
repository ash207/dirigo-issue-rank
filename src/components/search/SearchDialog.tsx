
import { useNavigate } from "react-router-dom";
import { useSearch } from "@/hooks/useSearch";
import { useEffect } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import {
  Command,
} from "@/components/ui/command";

import { SearchInput } from "./SearchInput";
import { SearchResults } from "./SearchResults";

export const SearchDialog = ({ open, setOpen }: { open: boolean; setOpen: (open: boolean) => void }) => {
  const navigate = useNavigate();
  const { searchTerm, setSearchTerm, results, isLoading, performSearch } = useSearch();

  // When dialog opens, trigger search if there's a searchTerm already
  useEffect(() => {
    if (open) {
      // Force a search whenever the dialog opens if there's a term
      if (searchTerm.length >= 2) {
        performSearch();
      }
    }
  }, [open, searchTerm, performSearch]);

  const handleSelect = (result: ReturnType<typeof useSearch>["results"][0]) => {
    if (result.type === "issue") {
      navigate(`/issues/${result.id}`);
    } else if (result.type === "user" || result.type === "email") {
      navigate(`/profile/${result.id}`);
    }
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px] p-0">
        <DialogHeader className="px-4 pt-4">
          <DialogTitle>Search</DialogTitle>
          <DialogDescription>
            Search for issues, users, and more
          </DialogDescription>
        </DialogHeader>
        <Command className="rounded-lg border shadow-md">
          <SearchInput 
            value={searchTerm} 
            onChange={setSearchTerm} 
          />
          <SearchResults 
            results={results} 
            isLoading={isLoading} 
            onSelectResult={handleSelect} 
          />
        </Command>
      </DialogContent>
    </Dialog>
  );
};
