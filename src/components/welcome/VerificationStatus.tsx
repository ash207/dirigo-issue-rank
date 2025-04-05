
interface VerificationStatusProps {
  isProcessingToken: boolean;
  tokenProcessed: boolean;
  verificationSuccess: boolean;
  email: string;
}

const VerificationStatus = ({ 
  isProcessingToken, 
  tokenProcessed, 
  verificationSuccess, 
  email 
}: VerificationStatusProps) => {
  
  if (isProcessingToken) {
    return (
      <p>
        Processing your confirmation link... Please wait.
      </p>
    );
  } 
  
  if (tokenProcessed) {
    return verificationSuccess ? (
      <p className="text-green-600">
        Your account has been confirmed successfully! You can now proceed to login.
      </p>
    ) : (
      <p className="text-amber-600">
        We couldn't verify your account automatically. Please try logging in or contact support.
      </p>
    );
  } 
  
  if (email) {
    return (
      <p>
        We've sent a verification link to <strong>{email}</strong>. 
        Please check your email and click the link to verify your account.
      </p>
    );
  } 
  
  return (
    <p>
      Your account has been created. Please check your email for a verification link.
    </p>
  );
};

export default VerificationStatus;
