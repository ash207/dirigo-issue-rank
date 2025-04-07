
import { useState } from "react";

export const useVoteState = () => {
  const [isVoting, setIsVoting] = useState<boolean>(false);

  return {
    isVoting,
    setIsVoting
  };
};
