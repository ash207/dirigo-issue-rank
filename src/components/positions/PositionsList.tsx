
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import PositionCard from "./PositionCard";
import CreatePositionForm from "./CreatePositionForm";
import { useCallback, useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface Position {
  id: string;
  title: string;
  content: string;
  author: {
    name: string;
    verificationLevel: "unverified" | "basic" | "voter" | "official";
  };
  votes: number;
  author_id?: string;
}

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

  const renderPositions = (positionsToRender: Position[]) => {
    if (positionsToRender.length === 0) {
      return (
        <div className="text-center py-4">
          <p className="text-muted-foreground">No positions to display</p>
        </div>
      );
    }

    const visiblePositions = positionsToRender.slice(0, visibleCount);
    const hasMore = positionsToRender.length > visibleCount;

    return (
      <div className="space-y-4">
        {visiblePositions.map(position => (
          <PositionCard 
            key={position.id}
            {...position}
            userVotedPosition={userVotedPosition}
            onVote={onVote}
            isAuthenticated={isAuthenticated}
            authorId={position.author_id}
            currentUserId={currentUserId}
            onPositionUpdated={refreshPositions}
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

  return (
    <>
      <div className="mb-4">
        <h2 className="text-xl font-bold">Positions</h2>
      </div>
      
      <Tabs defaultValue="top">
        <TabsList>
          <TabsTrigger value="top">Top</TabsTrigger>
          <TabsTrigger value="new">Newest</TabsTrigger>
          <TabsTrigger value="verified">Verified Only</TabsTrigger>
        </TabsList>

        <TabsContent value="top" className="space-y-4">
          {renderPositions(positions.sort((a, b) => b.votes - a.votes))}
        </TabsContent>

        <TabsContent value="new" className="space-y-4">
          {renderPositions(positions)}
        </TabsContent>

        <TabsContent value="verified" className="space-y-4">
          {renderPositions(positions.filter(p => 
            p.author.verificationLevel === "voter" || 
            p.author.verificationLevel === "official"
          ))}
        </TabsContent>
      </Tabs>

      <div className="mt-6">
        {isAuthenticated ? (
          <CreatePositionForm issueId={issueId} onSuccess={refreshPositions} />
        ) : (
          <Button 
            variant="outline"
            onClick={() => window.location.href = "/sign-in"}
            className="w-full sm:w-auto"
          >
            Sign in to add your position
          </Button>
        )}
      </div>
    </>
  );
};

export default PositionsList;
