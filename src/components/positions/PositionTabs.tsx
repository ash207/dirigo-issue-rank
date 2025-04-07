
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Position } from "@/types/positions";
import PositionsTabContent from "./PositionsTabContent";

interface PositionTabsProps {
  positions: Position[];
  visibleCount: number;
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
          positions={positions}
          visibleCount={visibleCount}
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
