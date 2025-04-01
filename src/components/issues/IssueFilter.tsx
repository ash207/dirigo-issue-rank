
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

interface IssueFilterProps {
  onFilterChange: (category: string, verification: string) => void;
}

const IssueFilter = ({ onFilterChange }: IssueFilterProps) => {
  const [category, setCategory] = useState("all");
  const [verification, setVerification] = useState("all");

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    onFilterChange(value, verification);
  };

  const handleVerificationChange = (value: string) => {
    setVerification(value);
    onFilterChange(category, value);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-2 mb-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full sm:w-auto">
            Category: {category === "all" ? "All" : category}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup value={category} onValueChange={handleCategoryChange}>
            <DropdownMenuRadioItem value="all">All Categories</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="local">Local</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="state">State</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="federal">Federal</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="education">Education</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="economy">Economy</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="environment">Environment</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full sm:w-auto">
            Verification: {verification === "all" ? "All" : verification}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>Filter by Verification</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup value={verification} onValueChange={handleVerificationChange}>
            <DropdownMenuRadioItem value="all">All Users</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="basic">Basic Verified+</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="voter">Registered Voters+</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="official">Officials Only</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default IssueFilter;
