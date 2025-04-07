
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

  // Debug log
  console.log("useVoteHandler:", { 
    issueId, 
    userId, 
    isAuthenticated, 
    userVotedPosition, 
    isActiveUser 
  });

  // Handle vote functionality
  const handleVote = async (positionId: string, privacyLevel?: VotePrivacyLevel) => {
    console.log("handleVote called:", { positionId, privacyLevel, issueId });
    
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
    if (!userId) {
      toast.error("Unable to process vote: User ID is missing");
      return;
    }
    
    if (!issueId) {
      toast.error("Unable to process vote: Issue ID is missing");
      return;
    }

    // If we have a userVotedPosition that equals the positionId, it means we're removing a vote
    const isRemovingVote = userVotedPosition === positionId;
    
    // If we're removing a vote, we don't need a privacy level
    if (isRemovingVote) {
      privacyLevel = undefined;
    }
    // If we need a privacy level but don't have one, show the dialog
    else if (!privacyLevel) {
      // No privacy level specified, but we need one for a new vote
      setPendingVotePositionId(positionId);
      setShowPrivacyDialog(true);
      return;
    }

    // Now we can proceed with the vote operation
    setIsVoting(true);

    try {
      console.log("Processing vote:", { 
        isRemovingVote, 
        positionId, 
        userId, 
        privacyLevel,
        issueId
      });
      
      // If user already voted on a different position, remove that vote first
      if (userVotedPosition && userVotedPosition !== positionId) {
        await removeExistingVote(userVotedPosition, userId);
      }

      // If removing existing vote
      if (isRemovingVote) {
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
        if (privacyLevel === 'ghost') {
          // For ghost votes, use a direct INSERT without ON CONFLICT
          const { data, error } = await supabase.rpc('increment_anonymous_vote', {
            p_position_id: positionId
          });
          
          if (error) {
            console.error("Database error for ghost vote:", error);
            throw new Error("Failed to record your ghost vote");
          }
        } else {
          // For public votes, create a vote record
          const { error } = await supabase
            .from('position_votes')
            .insert({
              position_id: positionId,
              user_id: userId,
              privacy_level: privacyLevel,
              issue_id: issueId // Ensure issue_id is included
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
    console.log("Removing vote:", { positionId, userId });
    
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
