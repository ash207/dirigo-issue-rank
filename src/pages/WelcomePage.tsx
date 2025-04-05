
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const WelcomePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || "your account";
  
  // If user navigated here directly without email state, redirect to home
  useEffect(() => {
    if (!location.state?.email) {
      navigate("/");
    }
  }, [location.state, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Welcome!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p>
            We've sent a verification link to <strong>{email}</strong>. 
            Please check your email and click the link to verify your account.
          </p>
          
          <p className="text-sm text-muted-foreground">
            If you don't see the email, check your spam folder or try logging in.
          </p>
          
          <div className="flex flex-col space-y-3">
            <Button onClick={() => navigate("/login")}>
              Go to login
            </Button>
            <Button variant="outline" onClick={() => navigate("/")}>
              Return to home page
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WelcomePage;
