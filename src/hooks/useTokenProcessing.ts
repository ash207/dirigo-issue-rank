
import { useState, useCallback } from "react";

export const useTokenProcessing = () => {
  // Track token processing state
  const [isProcessingToken, setIsProcessingToken] = useState(false);
  
  // Track if token has been processed
  const [tokenProcessed, setTokenProcessed] = useState(false);
  
  // Track verification success
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  
  // Reset all states
  const resetTokenProcessing = useCallback(() => {
    setIsProcessingToken(false);
    setTokenProcessed(false);
    setVerificationSuccess(false);
  }, []);

  return {
    isProcessingToken,
    setIsProcessingToken,
    tokenProcessed,
    setTokenProcessed,
    verificationSuccess,
    setVerificationSuccess,
    resetTokenProcessing
  };
};
