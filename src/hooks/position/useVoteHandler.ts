
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { isValidUUID } from "./useVoteValidation";
import { VotePrivacyLevel } from "@/components/positions/dialogs/VotePrivacyDialog";

export const useVoteHandler = (
  issueId: string | undefined, 
  userId: string | undefined, 
  isAuthenticated: boolean, 
  userVotedPosition: string | null,
  setUserVotedPosition: (positionId: string | null) => void,
  positionVotes: Record<string, number>,
  setPositionVotes: React.Dispatch<React.SetStateAction<Record<string, number>>>,
  isActiveUser: boolean = false,
  refreshVotes?: () => void
) => {
  const [isVoting, setIsVoting] = useState<boolean>(false);
  const [showPrivacyDialog, setShowPrivacyDialog] = useState<boolean>(false);
  const [pendingVotePositionId, setPendingVotePositionId] = useState<string | null>(null);

  // Handle vote functionality
  const handleVote = async (positionId: string, privacyLevel?: VotePrivacyLevel) => {
    // If not authenticated, show toast and return
    if (!isAuthenticated) {
      toast.error("Please sign in to vote on positions");
      return;
    }

    // If user not active, show toast and return
    if (!isActiveUser) {
      toast.error("Your account needs to be active to vote");
      return;
    }

    // If no userId or issueId, show error and return
    if (!userId || !issueId) {
      toast.error("Unable to process vote at this time");
      return;
    }

    // Check if we're handling a vote continuation after privacy selection
    if (!privacyLevel) {
      // No privacy level specified, show the privacy dialog
      setPendingVotePositionId(positionId);
      setShowPrivacyDialog(true);
      return;
    }

    // Now we have a privacy level, proceed with vote
    setIsVoting(true);

    try {
      // If user already voted on a different position, remove that vote first
      if (userVotedPosition && userVotedPosition !== positionId) {
        await removeExistingVote(userVotedPosition, userId);
      }

      // If this is the same position user already voted on, remove the vote (toggle behavior)
      if (userVotedPosition === positionId) {
        await removeExistingVote(positionId, userId);
        
        // Update local state
        setUserVotedPosition(null);
        setPositionVotes(prev => ({
          ...prev,
          [positionId]: Math.max(0, (prev[positionId] || 0) - 1)
        }));
        
        toast.success("Vote removed");
      } else {
        // Cast a new vote based on privacy level
        if (privacyLevel === 'super_anonymous') {
          // For super anonymous votes, use the increment function
          const { data, error } = await supabase.rpc('increment_anonymous_vote', {
            p_position_id: positionId
          });
          
          if (error) throw error;
        } else {
          // For public or private votes, insert a record
          const { error } = await supabase
            .from('position_votes')
            .insert({
              position_id: positionId,
              user_id: userId,
              privacy_level: privacyLevel
            });
            
          if (error) throw error;
        }

        // Update local state
        setUserVotedPosition(positionId);
        setPositionVotes(prev => ({
          ...prev,
          [positionId]: (prev[positionId] || 0) + 1
        }));

        toast.success("Vote recorded");
      }

      // Refresh votes if callback provided
      if (refreshVotes) {
        refreshVotes();
      }
    } catch (error: any) {
      console.error("Error voting:", error);
      toast.error("Failed to process your vote");
    } finally {
      setIsVoting(false);
      setShowPrivacyDialog(false);
      setPendingVotePositionId(null);
    }
  };

  // Helper function to remove existing vote
  const removeExistingVote = async (positionId: string, userId: string) => {
    // For standard votes, we can delete the record
    const { error } = await supabase
      .from('position_votes')
      .delete()
      .eq('position_id', positionId)
      .eq('user_id', userId);
    
    // Note: For super_anonymous votes, we can't remove individual votes
    // as they're not tied to users. This is a limitation of the system.
    
    if (error) {
      console.error("Error removing vote:", error);
    }
  };

  return {
    handleVote,
    isVoting,
    showPrivacyDialog,
    setShowPrivacyDialog,
    pendingVotePositionId
  };
};
