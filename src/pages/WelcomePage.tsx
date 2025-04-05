
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTokenProcessing } from "@/hooks/useTokenProcessing";
import VerificationProcessor from "@/components/welcome/VerificationProcessor";
import VerificationStatus from "@/components/welcome/VerificationStatus";
import AccountActions from "@/components/welcome/AccountActions";
import NavigationButtons from "@/components/welcome/NavigationButtons";

const WelcomePage = () => {
  const location = useLocation();
  const [email, setEmail] = useState<string>(location.state?.email || "");
  const {
    isProcessingToken,
    setIsProcessingToken,
    tokenProcessed,
    setTokenProcessed,
    verificationSuccess,
    setVerificationSuccess
  } = useTokenProcessing();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Welcome!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <VerificationProcessor 
            email={email} 
            setEmail={setEmail} 
            setTokenProcessed={setTokenProcessed} 
            setVerificationSuccess={setVerificationSuccess}
            setIsProcessingToken={setIsProcessingToken}
          />
          
          <VerificationStatus 
            isProcessingToken={isProcessingToken} 
            tokenProcessed={tokenProcessed} 
            verificationSuccess={verificationSuccess} 
            email={email} 
          />
          
          <p className="text-sm text-muted-foreground">
            If you don't see the email, check your spam folder or try the options below.
          </p>
          
          <div className="flex flex-col space-y-3">
            <AccountActions 
              email={email} 
              tokenProcessed={tokenProcessed} 
              isProcessingToken={isProcessingToken} 
            />
            <NavigationButtons />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WelcomePage;
