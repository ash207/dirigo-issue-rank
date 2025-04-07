
// This file now serves as a placeholder with minimal functionality for interface compatibility
import { useState } from "react";

export const usePositionVotes = () => {
  const [isActiveUser] = useState(true);
  
  // Return simplified interface without voting functionality
  return { 
    userVotedPosition: null, 
    positionVotes: {}, 
    handleVote: () => {}, 
    isActiveUser 
  };
};

export default usePositionVotes;
