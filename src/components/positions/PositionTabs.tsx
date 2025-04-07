
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Position } from "@/types/positions";
import PositionsTabContent from "./PositionsTabContent";
import { VotePrivacyLevel } from "./dialogs/VotePrivacyDialog";

interface PositionTabsProps {
  positions: Position[];
  visibleCount: number;
  isAuthenticated: boolean;
  currentUserId?: string;
  onPositionUpdated: () => void;
  loadMore: () => void;
  issueId: string;
  isActiveUser?: boolean;
  positionVotes?: Record<string, number>;
  userVotedPosition?: string | null;
  onVote?: (positionId: string, privacyLevel?: VotePrivacyLevel) => void;
  isVoting?: boolean;
  hasGhostVoted?: boolean;
}

const PositionTabs = ({
  positions,
  visibleCount,
  isAuthenticated,
  currentUserId,
  onPositionUpdated,
  loadMore,
  issueId,
  isActiveUser = true,
  positionVotes = {},
  userVotedPosition = null,
  onVote,
  isVoting = false,
  hasGhostVoted = false
}: PositionTabsProps) => {
  // Sort positions by votes for "Top" tab
  const topPositions = [...positions].sort((a, b) => 
    (positionVotes[b.id] || 0) - (positionVotes[a.id] || 0)
  );

  // Sort positions by date for "Newest" tab (assuming newest first)
  const newestPositions = [...positions].sort((a, b) => {
    if (!a.created_at || !b.created_at) return 0;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  // Filter verified positions
  const verifiedPositions = positions.filter(p => 
    p.author.verificationLevel === "voter" || 
    p.author.verificationLevel === "official"
  );

  return (
    <Tabs defaultValue="top">
      <TabsList>
        <TabsTrigger value="top">Top</TabsTrigger>
        <TabsTrigger value="new">Newest</TabsTrigger>
        <TabsTrigger value="verified">Verified Only</TabsTrigger>
      </TabsList>

      <TabsContent value="top">
        <PositionsTabContent
          positions={topPositions}
          visibleCount={visibleCount}
          isAuthenticated={isAuthenticated}
          currentUserId={currentUserId}
          onPositionUpdated={onPositionUpdated}
          loadMore={loadMore}
          issueId={issueId}
          isActiveUser={isActiveUser}
          positionVotes={positionVotes}
          userVotedPosition={userVotedPosition}
          onVote={onVote}
          isVoting={isVoting}
          hasGhostVoted={hasGhostVoted}
        />
      </TabsContent>

      <TabsContent value="new">
        <PositionsTabContent
          positions={newestPositions}
          visibleCount={visibleCount}
          isAuthenticated={isAuthenticated}
          currentUserId={currentUserId}
          onPositionUpdated={onPositionUpdated}
          loadMore={loadMore}
          issueId={issueId}
          isActiveUser={isActiveUser}
          positionVotes={positionVotes}
          userVotedPosition={userVotedPosition}
          onVote={onVote}
          isVoting={isVoting}
          hasGhostVoted={hasGhostVoted}
        />
      </TabsContent>

      <TabsContent value="verified">
        <PositionsTabContent
          positions={verifiedPositions}
          visibleCount={visibleCount}
          isAuthenticated={isAuthenticated}
          currentUserId={currentUserId}
          onPositionUpdated={onPositionUpdated}
          loadMore={loadMore}
          issueId={issueId}
          isActiveUser={isActiveUser}
          positionVotes={positionVotes}
          userVotedPosition={userVotedPosition}
          onVote={onVote}
          isVoting={isVoting}
          hasGhostVoted={hasGhostVoted}
        />
      </TabsContent>
    </Tabs>
  );
};

export default PositionTabs;
