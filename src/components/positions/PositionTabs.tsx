
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Position } from "@/types/positions";
import PositionsTabContent from "./PositionsTabContent";

interface PositionTabsProps {
  positions: Position[];
  visibleCount: number;
  userVotedPosition: string | null;
  positionVotes: Record<string, number>;
  onVote: (positionId: string) => void;
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
  return (
    <Tabs defaultValue="top">
      <TabsList>
        <TabsTrigger value="top">Top</TabsTrigger>
        <TabsTrigger value="new">Newest</TabsTrigger>
        <TabsTrigger value="verified">Verified Only</TabsTrigger>
      </TabsList>

      <TabsContent value="top">
        <PositionsTabContent
          positions={positions.sort((a, b) => b.votes - a.votes)}
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
          positions={positions}
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
          positions={positions.filter(p => 
            p.author.verificationLevel === "voter" || 
            p.author.verificationLevel === "official"
          )}
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
