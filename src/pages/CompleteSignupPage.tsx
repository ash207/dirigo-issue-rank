
import { NewSignupForm } from "@/components/auth/NewSignupForm";
import { useNewSignup } from "@/hooks/useNewSignup";

const CompleteSignupPage = () => {
  const {
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    isLoading,
    isCheckingEmail,
    errorMessage,
    handleSubmit
  } = useNewSignup();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <NewSignupForm
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        confirmPassword={confirmPassword}
        setConfirmPassword={setConfirmPassword}
        errorMessage={errorMessage}
        isLoading={isLoading}
        isCheckingEmail={isCheckingEmail}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default CompleteSignupPage;
