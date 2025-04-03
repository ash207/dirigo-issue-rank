
import { useCallback, useState, useEffect } from "react";
import CreatePositionForm from "./CreatePositionForm";
import CreatePositionButton from "./CreatePositionButton";
import PositionTabs from "./PositionTabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Position } from "@/types/positions";

interface PositionsListProps {
  positions: Position[];
  issueId: string;
  isAuthenticated: boolean;
  userVotedPosition: string | null;
  positionVotes?: Record<string, number>;
  onVote: (positionId: string) => void;
  currentUserId?: string;
  onPositionUpdated?: () => void;
}

const PositionsList = ({ 
  positions: initialPositions,
  issueId,
  isAuthenticated,
  userVotedPosition,
  positionVotes = {},
  onVote,
  currentUserId,
  onPositionUpdated
}: PositionsListProps) => {
  const [positions, setPositions] = useState<Position[]>(initialPositions);
  const [visibleCount, setVisibleCount] = useState(3);
  const [isOpen, setIsOpen] = useState(false);
  
  // Update positions when initialPositions changes or vote counts change
  useEffect(() => {
    // Merge current vote counts from positionVotes with positions data
    const updatedPositions = initialPositions.map(position => ({
      ...position,
      votes: positionVotes[position.id] !== undefined ? positionVotes[position.id] : position.votes
    }));
    
    setPositions(updatedPositions);
    console.log("PositionsList updated with votes:", positionVotes, updatedPositions);
  }, [initialPositions, positionVotes]);

  const refreshPositions = useCallback(() => {
    // In a real app, this would fetch updated positions from the API
    // For now, we just update the local state with the initial positions
    setPositions([...initialPositions]);
    if (onPositionUpdated) {
      onPositionUpdated();
    }
  }, [initialPositions, onPositionUpdated]);

  const loadMore = () => {
    setVisibleCount(prev => prev + 5);
  };

  const handlePositionCreated = () => {
    refreshPositions();
    setIsOpen(false);
  };

  return (
    <>
      <div className="mb-4">
        <h2 className="text-xl font-bold">Positions</h2>
      </div>
      
      <PositionTabs
        positions={positions}
        visibleCount={visibleCount}
        userVotedPosition={userVotedPosition}
        positionVotes={positionVotes}
        onVote={onVote}
        isAuthenticated={isAuthenticated}
        currentUserId={currentUserId}
        onPositionUpdated={refreshPositions}
        loadMore={loadMore}
        issueId={issueId}
      />

      <div className="mt-6">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <div>
              <CreatePositionButton 
                isAuthenticated={isAuthenticated} 
                onClick={() => setIsOpen(true)} 
              />
            </div>
          </DialogTrigger>
          {isOpen && (
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add Your Position on This Issue</DialogTitle>
              </DialogHeader>
              <CreatePositionForm 
                issueId={issueId} 
                onSuccess={handlePositionCreated} 
              />
            </DialogContent>
          )}
        </Dialog>
      </div>
    </>
  );
};

export default PositionsList;
