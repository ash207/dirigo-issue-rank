
import { useState } from "react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";

interface AnalyticsTableFiltersProps {
  activeTab: 'activity' | 'roles';
  setActiveTab: (tab: 'activity' | 'roles') => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export function AnalyticsTableFilters({
  activeTab,
  setActiveTab,
  searchTerm,
  setSearchTerm
}: AnalyticsTableFiltersProps) {
  return (
    <div className="flex justify-between items-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            {activeTab === 'activity' ? 'User Activity' : 'User Roles'}
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Select data to view</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setActiveTab('activity')}>
            User Activity
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setActiveTab('roles')}>
            User Roles
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Input
        placeholder="Search..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="max-w-sm"
      />
    </div>
  );
}
