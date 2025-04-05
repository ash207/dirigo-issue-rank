
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEmailAuth } from "@/hooks/useEmailAuth";
import { EmailSignInForm } from "@/components/auth/EmailSignInForm";
import Layout from "@/components/layout/Layout";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function EmailSignInPage() {
  const { 
    email, 
    setEmail, 
    password, 
    setPassword, 
    isLoading, 
    error, 
    handleSignIn 
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
            <CardTitle className="text-2xl">Sign in</CardTitle>
            <CardDescription>
              Enter your email and password to access your account
            </CardDescription>
          </CardHeader>
          
          <EmailSignInForm
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            error={error}
            isLoading={isLoading}
            onSubmit={handleSignIn}
          />
        </Card>
      </div>
    </Layout>
  );
}
