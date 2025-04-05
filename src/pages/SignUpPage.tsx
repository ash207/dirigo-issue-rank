
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/layout/Layout";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { TimeoutDialog } from "@/components/auth/TimeoutDialog";

const SignUpPage = () => {
  const [showTimeoutDialog, setShowTimeoutDialog] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handleTimeoutError = () => {
    setShowTimeoutDialog(true);
  };

  const handleRetry = () => {
    // This will be passed to the dialog to handle retry button clicks
    setShowTimeoutDialog(false);
  };

  return (
    <Layout>
      <div className="container mx-auto max-w-lg py-10">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Create an account</CardTitle>
            <CardDescription>
              Enter your information to create an account
            </CardDescription>
          </CardHeader>
          
          <SignUpForm onTimeoutError={handleTimeoutError} />
        </Card>
      </div>

      <TimeoutDialog 
        open={showTimeoutDialog} 
        onOpenChange={setShowTimeoutDialog}
        onRetry={handleRetry}
      />
    </Layout>
  );
};

export default SignUpPage;
