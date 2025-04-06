
import { SortAsc, SortDesc } from "lucide-react";

type SortConfig = {
  key: string;
  direction: 'asc' | 'desc';
};

interface AnalyticsSortButtonProps {
  label: string;
  sortKey: string;
  currentSort: SortConfig;
  onSort: (key: string) => void;
}

export function AnalyticsSortButton({ 
  label, 
  sortKey, 
  currentSort, 
  onSort 
}: AnalyticsSortButtonProps) {
  return (
    <button 
      className="flex items-center space-x-1"
      onClick={() => onSort(sortKey)}
    >
      <span>{label}</span>
      {currentSort.key === sortKey && (
        currentSort.direction === 'asc' 
          ? <SortAsc className="h-4 w-4" /> 
          : <SortDesc className="h-4 w-4" />
      )}
    </button>
  );
}
