
import React from "react";
import { User, AlertCircle, Mail, ExternalLink } from "lucide-react";
import { CommandItem } from "@/components/ui/command";
import { type SearchResult } from "@/hooks/useSearch";

interface SearchResultItemProps {
  result: SearchResult;
  onSelect: (result: SearchResult) => void;
}

export const SearchResultItem = ({ result, onSelect }: SearchResultItemProps) => {
  const getIcon = () => {
    switch (result.type) {
      case "user":
        return <User className="h-4 w-4 text-muted-foreground" />;
      case "issue":
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
      case "email":
        return <Mail className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <CommandItem
      key={`${result.type}-${result.id}`}
      onSelect={() => onSelect(result)}
      className="flex items-center gap-2 px-4 py-2 cursor-pointer"
    >
      {getIcon()}
      <div className="flex flex-col flex-1 truncate">
        <span className="font-medium">{result.title}</span>
        {result.subtitle && (
          <span className="text-xs text-muted-foreground truncate">{result.subtitle}</span>
        )}
      </div>
      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-70" />
    </CommandItem>
  );
};
