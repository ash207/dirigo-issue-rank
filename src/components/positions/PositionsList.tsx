
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import PositionCard from "./PositionCard";

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
  isAuthenticated: boolean;
  userVotedPosition: string | null;
  onVote: (positionId: string) => void;
}

const PositionsList = ({ 
  positions,
  isAuthenticated,
  userVotedPosition,
  onVote
}: PositionsListProps) => {
  return (
    <>
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-bold">Positions</h2>
        {!isAuthenticated && (
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
          {positions.sort((a, b) => b.votes - a.votes).map(position => (
            <PositionCard 
              key={position.id}
              {...position}
              userVotedPosition={userVotedPosition}
              onVote={onVote}
              isAuthenticated={isAuthenticated}
            />
          ))}
        </TabsContent>

        <TabsContent value="new" className="space-y-4">
          {/* In real app, would be sorted by date */}
          {positions.map(position => (
            <PositionCard 
              key={position.id}
              {...position}
              userVotedPosition={userVotedPosition}
              onVote={onVote}
              isAuthenticated={isAuthenticated}
            />
          ))}
        </TabsContent>

        <TabsContent value="verified" className="space-y-4">
          {positions
            .filter(p => p.author.verificationLevel === "voter" || p.author.verificationLevel === "official")
            .map(position => (
              <PositionCard 
                key={position.id} 
                {...position}
                userVotedPosition={userVotedPosition}
                onVote={onVote}
                isAuthenticated={isAuthenticated}
              />
            ))}
        </TabsContent>
      </Tabs>
    </>
  );
};

export default PositionsList;
