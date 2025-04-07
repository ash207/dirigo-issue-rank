
import { useState } from "react";
import PositionTabs from "./PositionTabs";
import CreatePositionButton from "./CreatePositionButton";
import { Position } from "@/types/positions";

interface PositionsListProps {
  positions: Position[];
  issueId: string;
  isAuthenticated: boolean;
  onAddPosition?: () => void;
  currentUserId?: string;
  onPositionUpdated?: () => void;
  isActiveUser?: boolean;
}

const PositionsList = ({ 
  positions, 
  issueId,
  isAuthenticated,
  onAddPosition,
  currentUserId,
  onPositionUpdated,
  isActiveUser = true
}: PositionsListProps) => {
  const [visibleCount, setVisibleCount] = useState(5);
  
  const loadMore = () => {
    setVisibleCount(prev => prev + 5);
  };

  return (
    <div className="mt-4 space-y-4 pb-8">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Positions</h2>
        <CreatePositionButton 
          isAuthenticated={isAuthenticated} 
          onAddPosition={onAddPosition}
        />
      </div>
      
      <PositionTabs 
        positions={positions}
        visibleCount={visibleCount}
        isAuthenticated={isAuthenticated}
        currentUserId={currentUserId}
        onPositionUpdated={onPositionUpdated || (() => {})}
        loadMore={loadMore}
        issueId={issueId}
        isActiveUser={isActiveUser}
      />
    </div>
  );
};

export default PositionsList;
