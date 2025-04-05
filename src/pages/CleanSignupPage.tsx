
import { useAuth } from "@/hooks/useAuth";
import { CleanSignupForm } from "@/components/auth/CleanSignupForm";

const CleanSignupPage = () => {
  const {
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    state,
    error,
    isCheckingEmail,
    isCreatingUser,
    handleSignup
  } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <CleanSignupForm
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        confirmPassword={confirmPassword}
        setConfirmPassword={setConfirmPassword}
        error={error}
        state={state}
        isCheckingEmail={isCheckingEmail}
        isCreatingUser={isCreatingUser}
        handleSignup={handleSignup}
      />
    </div>
  );
};

export default CleanSignupPage;
