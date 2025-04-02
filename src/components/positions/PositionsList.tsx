
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import PositionCard from "./PositionCard";
import CreatePositionForm from "./CreatePositionForm";
import { useCallback, useState, useEffect } from "react";

interface Position {
  id: string;
  title: string;
  content: string;
  author: {
    name: string;
    verificationLevel: "unverified" | "basic" | "voter" | "official";
  };
  votes: number;
}

interface PositionsListProps {
  positions: Position[];
  issueId: string;
  isAuthenticated: boolean;
  userVotedPosition: string | null;
  onVote: (positionId: string) => void;
}

const PositionsList = ({ 
  positions: initialPositions,
  issueId,
  isAuthenticated,
  userVotedPosition,
  onVote
}: PositionsListProps) => {
  const [positions, setPositions] = useState<Position[]>(initialPositions);

  // Update positions when initialPositions changes
  useEffect(() => {
    setPositions(initialPositions);
    console.log("PositionsList received positions:", initialPositions);
  }, [initialPositions]);

  const refreshPositions = useCallback(() => {
    // In a real app, this would fetch updated positions from the API
    // For now, we just update the local state with the initial positions
    setPositions([...initialPositions]);
  }, [initialPositions]);

  return (
    <>
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-bold">Positions</h2>
        {isAuthenticated ? (
          <CreatePositionForm issueId={issueId} onSuccess={refreshPositions} />
        ) : (
          <Button 
            variant="outline"
            onClick={() => window.location.href = "/sign-in"}
          >
            Sign in to vote
          </Button>
        )}
      </div>
      
      <Tabs defaultValue="top">
        <TabsList>
          <TabsTrigger value="top">Top</TabsTrigger>
          <TabsTrigger value="new">Newest</TabsTrigger>
          <TabsTrigger value="verified">Verified Only</TabsTrigger>
        </TabsList>

        <TabsContent value="top" className="space-y-4">
          {positions.length > 0 ? (
            positions.sort((a, b) => b.votes - a.votes).map(position => (
              <PositionCard 
                key={position.id}
                {...position}
                userVotedPosition={userVotedPosition}
                onVote={onVote}
                isAuthenticated={isAuthenticated}
              />
            ))
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground">No positions to display</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="new" className="space-y-4">
          {positions.length > 0 ? (
            positions.map(position => (
              <PositionCard 
                key={position.id}
                {...position}
                userVotedPosition={userVotedPosition}
                onVote={onVote}
                isAuthenticated={isAuthenticated}
              />
            ))
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground">No positions to display</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="verified" className="space-y-4">
          {positions.filter(p => p.author.verificationLevel === "voter" || p.author.verificationLevel === "official").length > 0 ? (
            positions
              .filter(p => p.author.verificationLevel === "voter" || p.author.verificationLevel === "official")
              .map(position => (
                <PositionCard 
                  key={position.id} 
                  {...position}
                  userVotedPosition={userVotedPosition}
                  onVote={onVote}
                  isAuthenticated={isAuthenticated}
                />
              ))
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground">No verified positions to display</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </>
  );
};

export default PositionsList;
