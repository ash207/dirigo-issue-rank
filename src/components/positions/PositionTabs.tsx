
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Position } from "@/types/positions";
import PositionsTabContent from "./PositionsTabContent";
import { VotePrivacyLevel } from "./dialogs/VotePrivacyDialog";

interface PositionTabsProps {
  positions: Position[];
  visibleCount: number;
  userVotedPosition: string | null;
  positionVotes: Record<string, number>;
  onVote: (positionId: string, privacyLevel?: VotePrivacyLevel) => void;
  isAuthenticated: boolean;
  currentUserId?: string;
  onPositionUpdated: () => void;
  loadMore: () => void;
  issueId: string;
  isActiveUser?: boolean;
}

const PositionTabs = ({
  positions,
  visibleCount,
  userVotedPosition,
  positionVotes,
  onVote,
  isAuthenticated,
  currentUserId,
  onPositionUpdated,
  loadMore,
  issueId,
  isActiveUser = true
}: PositionTabsProps) => {
  // Helper function to get actual votes from the positionVotes object
  const getPositionWithVotes = (position: Position) => {
    return {
      ...position,
      votes: positionVotes[position.id] !== undefined ? positionVotes[position.id] : position.votes
    };
  };

  return (
    <Tabs defaultValue="top">
      <TabsList>
        <TabsTrigger value="top">Top</TabsTrigger>
        <TabsTrigger value="new">Newest</TabsTrigger>
        <TabsTrigger value="verified">Verified Only</TabsTrigger>
      </TabsList>

      <TabsContent value="top">
        <PositionsTabContent
          positions={positions.map(getPositionWithVotes).sort((a, b) => b.votes - a.votes)}
          visibleCount={visibleCount}
          userVotedPosition={userVotedPosition}
          positionVotes={positionVotes}
          onVote={onVote}
          isAuthenticated={isAuthenticated}
          currentUserId={currentUserId}
          onPositionUpdated={onPositionUpdated}
          loadMore={loadMore}
          issueId={issueId}
          isActiveUser={isActiveUser}
        />
      </TabsContent>

      <TabsContent value="new">
        <PositionsTabContent
          positions={positions.map(getPositionWithVotes)}
          visibleCount={visibleCount}
          userVotedPosition={userVotedPosition}
          positionVotes={positionVotes}
          onVote={onVote}
          isAuthenticated={isAuthenticated}
          currentUserId={currentUserId}
          onPositionUpdated={onPositionUpdated}
          loadMore={loadMore}
          issueId={issueId}
          isActiveUser={isActiveUser}
        />
      </TabsContent>

      <TabsContent value="verified">
        <PositionsTabContent
          positions={positions
            .filter(p => 
              p.author.verificationLevel === "voter" || 
              p.author.verificationLevel === "official"
            )
            .map(getPositionWithVotes)
          }
          visibleCount={visibleCount}
          userVotedPosition={userVotedPosition}
          positionVotes={positionVotes}
          onVote={onVote}
          isAuthenticated={isAuthenticated}
          currentUserId={currentUserId}
          onPositionUpdated={onPositionUpdated}
          loadMore={loadMore}
          issueId={issueId}
          isActiveUser={isActiveUser}
        />
      </TabsContent>
    </Tabs>
  );
};

export default PositionTabs;
