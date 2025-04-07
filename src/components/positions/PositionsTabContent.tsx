
import { Position } from "@/types/positions";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import PositionCard from "./PositionCard";

interface PositionsTabContentProps {
  positions: Position[];
  visibleCount: number;
  isAuthenticated: boolean;
  currentUserId?: string;
  onPositionUpdated: () => void;
  loadMore: () => void;
  issueId: string;
  isActiveUser?: boolean;
}

const PositionsTabContent = ({
  positions,
  visibleCount,
  isAuthenticated,
  currentUserId,
  onPositionUpdated,
  loadMore,
  issueId,
  isActiveUser = true
}: PositionsTabContentProps) => {
  if (positions.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-muted-foreground">No positions to display</p>
      </div>
    );
  }

  const visiblePositions = positions.slice(0, visibleCount);
  const hasMore = positions.length > visibleCount;

  return (
    <div className="space-y-4">
      {visiblePositions.map(position => (
        <PositionCard 
          key={position.id}
          id={position.id}
          title={position.title}
          content={position.content}
          author={position.author}
          isAuthenticated={isAuthenticated}
          author_id={position.author_id}
          currentUserId={currentUserId}
          onPositionUpdated={onPositionUpdated}
          issueId={issueId}
          isActiveUser={isActiveUser}
        />
      ))}
      
      {hasMore && (
        <div className="flex justify-start mt-4">
          <Button 
            variant="outline" 
            onClick={loadMore}
            className="gap-2"
          >
            <ChevronDown size={16} />
            Load More Positions
          </Button>
        </div>
      )}
    </div>
  );
};

export default PositionsTabContent;
