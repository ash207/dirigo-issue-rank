
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
  const { data: oldPosition } = await supabase
    .from('positions')
    .select('votes')
    .eq('id', userVotedPosition)
    .single();
    
  if (oldPosition) {
    const newCount = Math.max(0, oldPosition.votes - 1);
    await supabase
      .from('positions')
      .update({ votes: newCount })
      .eq('id', userVotedPosition);
    
    // Update local state for the position
    updatePositionVote(userVotedPosition, newCount, setPositionVotes);
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
  // First, remove the old vote by decrementing the count
  const { data: oldPosition } = await supabase
    .from('positions')
    .select('votes')
    .eq('id', userVotedPosition)
    .single();
    
  if (oldPosition) {
    const newCount = Math.max(0, oldPosition.votes - 1);
    await supabase
      .from('positions')
      .update({ votes: newCount })
      .eq('id', userVotedPosition);
    
    // Update local state for the old position
    updatePositionVote(userVotedPosition, newCount, setPositionVotes);
    console.log(`Decreased vote count for position ${userVotedPosition} to ${newCount}`);
  }
  
  // Delete the old vote record (for non-super-anonymous votes)
  await supabase
    .from('user_votes')
    .delete()
    .eq('user_id', userId)
    .eq('issue_id', issueId);
  
  // Then add the new vote based on privacy level
  if (privacyLevel === 'super_anonymous') {
    // Use the dedicated RPC function for super anonymous votes
    const { error } = await supabase.rpc('cast_super_anonymous_vote', {
      p_issue_id: issueId,
      p_position_id: positionId
    });
    
    if (error) throw error;
    
    // Fetch the updated position vote count
    const { data: newPosition } = await supabase
      .from('positions')
      .select('votes')
      .eq('id', positionId)
      .single();
      
    if (newPosition) {
      // Update local state for the new position
      updatePositionVote(positionId, newPosition.votes, setPositionVotes);
      console.log(`Increased vote count for position ${positionId} to ${newPosition.votes}`);
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
    
    // Increment the vote count for the new position
    const { data: newPosition } = await supabase
      .from('positions')
      .select('votes')
      .eq('id', positionId)
      .single();
      
    if (newPosition) {
      const newCount = newPosition.votes + 1;
      await supabase
        .from('positions')
        .update({ votes: newCount })
        .eq('id', positionId);
      
      // Update local state for the new position
      updatePositionVote(positionId, newCount, setPositionVotes);
      console.log(`Increased vote count for position ${positionId} to ${newCount}`);
    }
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
  if (privacyLevel === 'super_anonymous') {
    // Use the dedicated RPC function for super anonymous votes
    const { error } = await supabase.rpc('cast_super_anonymous_vote', {
      p_issue_id: issueId,
      p_position_id: positionId
    });
    
    if (error) throw error;
    
    // Fetch the updated vote count
    const { data: position } = await supabase
      .from('positions')
      .select('votes')
      .eq('id', positionId)
      .single();
      
    if (position) {
      // Update local state
      updatePositionVote(positionId, position.votes, setPositionVotes);
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
    
    // Increment the vote count
    const { data: position } = await supabase
      .from('positions')
      .select('votes')
      .eq('id', positionId)
      .single();
      
    if (position) {
      const newCount = position.votes + 1;
      await supabase
        .from('positions')
        .update({ votes: newCount })
        .eq('id', positionId);
      
      // Update local state
      updatePositionVote(positionId, newCount, setPositionVotes);
      console.log(`Set vote count for position ${positionId} to ${newCount}`);
    }
  }
  
  toast.success("Your vote has been recorded!");
};
