
import { useState } from "react";
import PositionTabs from "./PositionTabs";
import { Position } from "@/types/positions";
import { usePositionVotes } from "@/hooks/position/usePositionVotes";
import CreatePositionButton from "./CreatePositionButton";

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
  
  // Add debug logging
  console.log("PositionsList props:", { issueId, positions, isAuthenticated, currentUserId });
  
  const {
    positionVotes,
    userVotedPosition,
    handleVote,
    isVoting,
    isActiveUser: activeVoteUser,
    hasGhostVoted,
    ghostVotedPositionId
  } = usePositionVotes(issueId);
  
  // Add debug logging for vote states
  console.log("Vote state:", { 
    positionVotes, 
    userVotedPosition, 
    isVoting, 
    activeVoteUser,
    hasGhostVoted,
    ghostVotedPositionId
  });
  
  const loadMore = () => {
    setVisibleCount(prev => prev + 5);
  };

  return (
    <div className="mt-4 space-y-4 pb-8">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Positions</h2>
        
        {hasGhostVoted && (
          <div className="text-amber-600 text-sm">
            You've cast a ghost vote on this issue.
          </div>
        )}
      </div>
      
      <PositionTabs 
        positions={positions}
        visibleCount={visibleCount}
        isAuthenticated={isAuthenticated}
        currentUserId={currentUserId}
        onPositionUpdated={onPositionUpdated || (() => {})}
        loadMore={loadMore}
        issueId={issueId}
        isActiveUser={isActiveUser && activeVoteUser}
        positionVotes={positionVotes}
        userVotedPosition={userVotedPosition}
        onVote={handleVote}
        isVoting={isVoting}
        hasGhostVoted={hasGhostVoted}
        ghostVotedPositionId={ghostVotedPositionId}
      />
      
      {/* Position button placed below the positions list */}
      <div className="mt-6">
        <CreatePositionButton 
          isAuthenticated={isAuthenticated} 
          onAddPosition={onAddPosition || (() => {})}
        />
      </div>
    </div>
  );
};

export default PositionsList;
