
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
import { Globe, Landmark, Flag } from "lucide-react";

interface IssueFilterProps {
  onFilterChange: (category: string, verification: string, scope: string) => void;
}

const IssueFilter = ({ onFilterChange }: IssueFilterProps) => {
  const [category, setCategory] = useState("all");
  const [verification, setVerification] = useState("all");
  const [scope, setScope] = useState("all");

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    onFilterChange(value, verification, scope);
  };

  const handleVerificationChange = (value: string) => {
    setVerification(value);
    onFilterChange(category, value, scope);
  };

  const handleScopeChange = (value: string) => {
    setScope(value);
    onFilterChange(category, verification, value);
  };

  const getScopeIcon = (scopeValue: string) => {
    switch (scopeValue) {
      case "local":
        return <Landmark className="h-4 w-4 mr-2" />;
      case "international":
        return <Globe className="h-4 w-4 mr-2" />;
      case "county":
      case "state":
      case "federal":
        return <Flag className="h-4 w-4 mr-2" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-2 mb-4 flex-wrap">
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
            Scope: {scope === "all" ? "All" : scope}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>Filter by Scope</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup value={scope} onValueChange={handleScopeChange}>
            <DropdownMenuRadioItem value="all">All Scopes</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="local" className="flex items-center">
              <Landmark className="h-4 w-4 mr-2" /> Local
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="county" className="flex items-center">
              <Flag className="h-4 w-4 mr-2" /> County
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="state" className="flex items-center">
              <Flag className="h-4 w-4 mr-2" /> State
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="federal" className="flex items-center">
              <Flag className="h-4 w-4 mr-2" /> Federal
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="international" className="flex items-center">
              <Globe className="h-4 w-4 mr-2" /> International
            </DropdownMenuRadioItem>
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
