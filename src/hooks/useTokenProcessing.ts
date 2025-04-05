
import { useState } from "react";

export const useTokenProcessing = () => {
  const [isProcessingToken, setIsProcessingToken] = useState(false);
  const [tokenProcessed, setTokenProcessed] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);

  return {
    isProcessingToken,
    setIsProcessingToken,
    tokenProcessed,
    setTokenProcessed,
    verificationSuccess,
    setVerificationSuccess
  };
};
