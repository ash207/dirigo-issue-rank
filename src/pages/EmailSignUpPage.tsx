
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEmailAuth } from "@/hooks/useEmailAuth";
import { EmailSignUpForm } from "@/components/auth/EmailSignUpForm";
import Layout from "@/components/layout/Layout";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function EmailSignUpPage() {
  const { 
    email, 
    setEmail, 
    password, 
    setPassword, 
    confirmPassword, 
    setConfirmPassword,
    isLoading, 
    isCheckingEmail,
    error, 
    handleSignUp 
  } = useEmailAuth();
  
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  return (
    <Layout>
      <div className="container mx-auto max-w-md py-10">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Create an account</CardTitle>
            <CardDescription>
              Enter your email and create a secure password
            </CardDescription>
          </CardHeader>
          
          <EmailSignUpForm
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            error={error}
            isLoading={isLoading}
            isCheckingEmail={isCheckingEmail}
            onSubmit={handleSignUp}
          />
        </Card>
      </div>
    </Layout>
  );
}
