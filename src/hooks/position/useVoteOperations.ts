
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { VotePrivacyLevel } from "@/components/positions/dialogs/VotePrivacyDialog";
import { isValidUUID } from "./useVoteValidation";

// Helper to update the local state for position votes
export const updatePositionVote = (
  positionId: string, 
  newCount: number,
  setPositionVotes: React.Dispatch<React.SetStateAction<Record<string, number>>>
) => {
  console.log(`Updating vote count for position ${positionId} to ${newCount}`);
  setPositionVotes((prevVotes) => ({
    ...prevVotes,
    [positionId]: newCount
  }));
};

// Handle voting for mock data (non-UUID IDs)
export const handleMockVote = (
  userVotedPosition: string | null,
  positionId: string,
  positionVotes: Record<string, number>,
  setUserVotedPosition: (positionId: string | null) => void,
  setPositionVotes: React.Dispatch<React.SetStateAction<Record<string, number>>>
) => {
  // If already voted for this position, unvote
  if (userVotedPosition === positionId) {
    setUserVotedPosition(null);
    // Update local state for the position that was unvoted
    updatePositionVote(
      positionId, 
      Math.max(0, (positionVotes[positionId] || 1) - 1),
      setPositionVotes
    );
    toast.success("Your vote has been removed! (Mock)");
  } else {
    // If switching vote, decrease count on old position
    if (userVotedPosition) {
      updatePositionVote(
        userVotedPosition, 
        Math.max(0, (positionVotes[userVotedPosition] || 1) - 1),
        setPositionVotes
      );
    }
    // Increase count on new position
    updatePositionVote(
      positionId, 
      (positionVotes[positionId] || 0) + 1,
      setPositionVotes
    );
    setUserVotedPosition(positionId);
    toast.success("Your vote has been recorded! (Mock)");
  }
};

// Handle unvoting (removing a vote)
export const handleUnvote = async (
  userVotedPosition: string, 
  userId: string, 
  issueId: string,
  privacyLevel: VotePrivacyLevel | undefined,
  setPositionVotes: React.Dispatch<React.SetStateAction<Record<string, number>>>
) => {
  // Get current vote count before updating
  const { data: oldPosition } = await supabase
    .from('positions')
    .select('votes')
    .eq('id', userVotedPosition)
    .single();
    
  if (oldPosition) {
    const newCount = Math.max(0, oldPosition.votes - 1);
    
    // Update the database
    await supabase
      .from('positions')
      .update({ votes: newCount })
      .eq('id', userVotedPosition);
    
    // Update local state to reflect the change immediately
    updatePositionVote(userVotedPosition, newCount, setPositionVotes);
    console.log(`Decreased vote count for position ${userVotedPosition} to ${newCount}`);
  } else {
    console.error(`Could not find position ${userVotedPosition} to unvote`);
  }
  
  // Delete the vote record (if not super anonymous)
  if (privacyLevel !== 'super_anonymous') {
    await supabase
      .from('user_votes')
      .delete()
      .eq('user_id', userId)
      .eq('issue_id', issueId);
  } else {
    // Use edge function instead of direct RPC
    const { error } = await supabase.functions.invoke("delete-vote-tracking", {
      body: { user_id: userId, issue_id: issueId }
    });
    
    if (error) {
      console.error("Error deleting vote tracking:", error);
      throw error;
    }
  }
  
  toast.success("Your vote has been removed!");
};

// Handle changing a vote from one position to another
export const handleChangeVote = async (
  userVotedPosition: string,
  positionId: string,
  userId: string,
  issueId: string,
  privacyLevel: VotePrivacyLevel | undefined,
  setPositionVotes: React.Dispatch<React.SetStateAction<Record<string, number>>>
) => {
  console.log(`Changing vote from ${userVotedPosition} to ${positionId}`);
  
  // First, get the current vote counts
  const { data: positions, error: fetchError } = await supabase
    .from('positions')
    .select('id, votes')
    .in('id', [userVotedPosition, positionId]);
    
  if (fetchError) {
    console.error("Error fetching position votes:", fetchError);
    throw fetchError;
  }
  
  const oldPositionData = positions.find(p => p.id === userVotedPosition);
  const newPositionData = positions.find(p => p.id === positionId);
  
  if (!oldPositionData || !newPositionData) {
    console.error("Could not find one or both positions for vote change");
    throw new Error("Position not found");
  }
  
  // Calculate new votes for both positions
  const oldPositionNewVotes = Math.max(0, oldPositionData.votes - 1);
  const newPositionNewVotes = newPositionData.votes + 1;
  
  // Update the old position by decreasing its vote count
  const { error: oldPosError } = await supabase
    .from('positions')
    .update({ votes: oldPositionNewVotes })
    .eq('id', userVotedPosition);
    
  if (oldPosError) {
    console.error("Error updating old position vote count:", oldPosError);
    throw oldPosError;
  }
  
  // Update local state for the old position immediately
  updatePositionVote(userVotedPosition, oldPositionNewVotes, setPositionVotes);
  console.log(`Decreased vote count for position ${userVotedPosition} to ${oldPositionNewVotes}`);
  
  // Delete the old vote record
  await supabase
    .from('user_votes')
    .delete()
    .eq('user_id', userId)
    .eq('issue_id', issueId);
  
  // Handle the new vote based on privacy level
  if (privacyLevel === 'super_anonymous') {
    // Use the dedicated RPC function for super anonymous votes
    const { error } = await supabase.rpc('cast_super_anonymous_vote', {
      p_issue_id: issueId,
      p_position_id: positionId
    });
    
    if (error) throw error;
    
    // Fetch the updated position vote count
    const { data: updatedPos } = await supabase
      .from('positions')
      .select('votes')
      .eq('id', positionId)
      .single();
      
    if (updatedPos) {
      // Update local state for the new position
      updatePositionVote(positionId, updatedPos.votes, setPositionVotes);
      console.log(`Increased vote count for position ${positionId} to ${updatedPos.votes}`);
    }
  } else {
    // Insert regular vote with specified privacy
    const { error } = await supabase
      .from('user_votes')
      .insert({
        user_id: userId,
        issue_id: issueId,
        position_id: positionId,
        privacy_level: privacyLevel || 'public'
      });
    
    if (error) throw error;
    
    // Update the new position by increasing its vote count
    const { error: newPosError } = await supabase
      .from('positions')
      .update({ votes: newPositionNewVotes })
      .eq('id', positionId);
      
    if (newPosError) {
      console.error("Error updating new position vote count:", newPosError);
      throw newPosError;
    }
    
    // Update local state for the new position
    updatePositionVote(positionId, newPositionNewVotes, setPositionVotes);
    console.log(`Increased vote count for position ${positionId} to ${newPositionNewVotes}`);
  }
  
  toast.success("Your vote has been updated!");
};

// Handle first-time voting
export const handleNewVote = async (
  positionId: string,
  userId: string,
  issueId: string,
  privacyLevel: VotePrivacyLevel | undefined,
  setPositionVotes: React.Dispatch<React.SetStateAction<Record<string, number>>>
) => {
  // Get current vote count before updating
  const { data: position, error: fetchError } = await supabase
    .from('positions')
    .select('votes')
    .eq('id', positionId)
    .single();
    
  if (fetchError) {
    console.error("Error fetching position for new vote:", fetchError);
    throw fetchError;
  }
  
  const newCount = position.votes + 1;
  
  if (privacyLevel === 'super_anonymous') {
    // Use the dedicated RPC function for super anonymous votes
    const { error } = await supabase.rpc('cast_super_anonymous_vote', {
      p_issue_id: issueId,
      p_position_id: positionId
    });
    
    if (error) throw error;
    
    // Fetch the updated vote count
    const { data: updatedPos } = await supabase
      .from('positions')
      .select('votes')
      .eq('id', positionId)
      .single();
      
    if (updatedPos) {
      // Update local state
      updatePositionVote(positionId, updatedPos.votes, setPositionVotes);
      console.log(`Updated vote count for position ${positionId} to ${updatedPos.votes}`);
    }
  } else {
    // Insert regular vote with specified privacy
    const { error } = await supabase
      .from('user_votes')
      .insert({
        user_id: userId,
        issue_id: issueId,
        position_id: positionId,
        privacy_level: privacyLevel || 'public'
      });
    
    if (error) throw error;
    
    // Update the position's vote count
    const { error: updateError } = await supabase
      .from('positions')
      .update({ votes: newCount })
      .eq('id', positionId);
      
    if (updateError) {
      console.error("Error updating position vote count:", updateError);
      throw updateError;
    }
    
    // Update local state immediately
    updatePositionVote(positionId, newCount, setPositionVotes);
    console.log(`Set vote count for position ${positionId} to ${newCount}`);
  }
  
  toast.success("Your vote has been recorded!");
};
