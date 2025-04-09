
import React from "react";
import { CommandInput } from "@/components/ui/command";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const SearchInput = ({ 
  value, 
  onChange, 
  placeholder = "Search for issues, users, emails..." 
}: SearchInputProps) => {
  return (
    <CommandInput 
      placeholder={placeholder} 
      value={value}
      onValueChange={onChange}
    />
  );
};
