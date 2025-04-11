
import { useNavigate } from "react-router-dom";
import { useSearch } from "@/hooks/useSearch";
import { useEffect, useState } from "react";

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
  const [dialogMounted, setDialogMounted] = useState(false);

  // Track when dialog is fully mounted
  useEffect(() => {
    if (open) {
      setDialogMounted(true);
    } else {
      // Reset mounting state when dialog closes
      setDialogMounted(false);
    }
  }, [open]);

  // Force search when dialog opens if there's a term
  useEffect(() => {
    if (open && searchTerm.length >= 2) {
      console.log('Dialog open, running search for:', searchTerm);
      performSearch();
    }
  }, [open, searchTerm, performSearch]);

  // Debug logging for results
  useEffect(() => {
    if (open) {
      console.log('Current search results:', results);
    }
  }, [open, results]);

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
      <DialogContent 
        className="sm:max-w-[500px] p-0"
        // Ensure dialog events are not passive
        onPointerDownOutside={(e) => {
          e.preventDefault();
        }}
      >
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
          {dialogMounted && (
            <SearchResults 
              results={results || []} // Ensure results is always an array
              isLoading={isLoading} 
              onSelectResult={handleSelect}
              searchTerm={searchTerm}
            />
          )}
        </Command>
      </DialogContent>
    </Dialog>
  );
};
