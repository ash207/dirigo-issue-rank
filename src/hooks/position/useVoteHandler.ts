
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
          // For super anonymous votes, use a direct INSERT for now
          const { data, error } = await supabase
            .from('anonymous_vote_counts')
            .upsert({
              position_id: positionId,
              count: 1
            }, {
              onConflict: 'position_id',
              ignoreDuplicates: false
            });
          
          if (error) throw error;
        } else {
          // For public or private votes, create a vote record
          const { error } = await supabase
            .from('position_votes')
            .insert({
              position_id: positionId,
              user_id: userId,
              privacy_level: privacyLevel,
              issue_id: issueId
            });
          
          if (error) {
            console.error("Database error:", error);
            throw new Error("Failed to record your vote");
          }
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
    // Direct deletion of vote record
    const { error } = await supabase
      .from('position_votes')
      .delete()
      .eq('position_id', positionId)
      .eq('user_id', userId);
    
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
