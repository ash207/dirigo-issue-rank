
import { useState } from "react";
import { VotePrivacyLevel } from "@/components/positions/dialogs/VotePrivacyDialog";

export const useVoteDialog = () => {
  const [showPrivacyDialog, setShowPrivacyDialog] = useState<boolean>(false);
  const [pendingVotePositionId, setPendingVotePositionId] = useState<string | null>(null);

  const startVoteProcess = (positionId: string) => {
    setPendingVotePositionId(positionId);
    setShowPrivacyDialog(true);
  };

  const resetVoteDialog = () => {
    setShowPrivacyDialog(false);
    setPendingVotePositionId(null);
  };

  return {
    showPrivacyDialog,
    setShowPrivacyDialog,
    pendingVotePositionId,
    setPendingVotePositionId,
    startVoteProcess,
    resetVoteDialog
  };
};
