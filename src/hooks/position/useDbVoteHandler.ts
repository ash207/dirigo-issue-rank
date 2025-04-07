
import { supabase } from "@/integrations/supabase/client";
import { VotePrivacyLevel } from "@/components/positions/dialogs/VotePrivacyDialog";
import { removeVote, handleSuperAnonymousVote, handleStandardVote } from "./useVoteOperations";

/**
 * Handles database voting operations for valid UUID IDs
 */
export const handleDatabaseVote = async (
  issueId: string,
  positionId: string,
  userId: string, 
  userVotedPosition: string | null,
  positionVotes: Record<string, number>,
  updatePositionVote: (positionId: string, newCount: number) => void,
  setUserVotedPosition: (positionId: string | null) => void,
  privacyLevel?: VotePrivacyLevel
) => {
  try {
    // Case 1: User is unvoting their current position
    if (userVotedPosition === positionId) {
      const success = await removeVote(userId, issueId, userVotedPosition, updatePositionVote);
      if (success) {
        setUserVotedPosition(null);
      }
      return success;
    } 
    
    // Case 2: Super anonymous vote
    else if (privacyLevel === 'super_anonymous') {
      const success = await handleSuperAnonymousVote(
        userId, 
        issueId, 
        positionId, 
        userVotedPosition, 
        positionVotes, 
        updatePositionVote
      );
      
      if (success) {
        // Store the position ID only in local state for the current session
        setUserVotedPosition(positionId);
      }
      return success;
    }
    
    // Case 3: Standard vote (public or anonymous)
    else {
      const success = await handleStandardVote(
        userId, 
        issueId, 
        positionId, 
        userVotedPosition, 
        positionVotes, 
        updatePositionVote,
        privacyLevel
      );
      
      if (success) {
        setUserVotedPosition(positionId);
      }
      return success;
    }
  } catch (error: any) {
    console.error("Error in database vote handling:", error);
    return false;
  }
};
