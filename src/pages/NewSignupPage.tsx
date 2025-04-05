
import { TimeoutDialog } from "@/components/auth/TimeoutDialog";
import { SignupForm } from "@/components/auth/SignupFormNew";
import { useSignup } from "@/hooks/useSignup";
import { useExistingUserCheck } from "@/hooks/useExistingUserCheck";

const NewSignupPage = () => {
  const {
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    isLoading,
    errorMessage,
    showTimeoutDialog,
    setShowTimeoutDialog,
    handleSubmit,
    handleRetry
  } = useSignup();

  // Use the extracted hook for checking existing user
  useExistingUserCheck(showTimeoutDialog, email);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <SignupForm
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        confirmPassword={confirmPassword}
        setConfirmPassword={setConfirmPassword}
        errorMessage={errorMessage}
        isLoading={isLoading}
        onSubmit={handleSubmit}
      />

      <TimeoutDialog 
        open={showTimeoutDialog} 
        onOpenChange={setShowTimeoutDialog}
        onRetry={handleRetry}
        email={email}
      />
    </div>
  );
};

export default NewSignupPage;
