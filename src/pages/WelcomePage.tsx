
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const WelcomePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>(location.state?.email || "");
  
  // Check for email in location state or try to get it from session
  useEffect(() => {
    const checkEmailFromSession = async () => {
      if (!location.state?.email) {
        // Try to get the email from the current session
        const { data } = await supabase.auth.getSession();
        if (data.session?.user?.email) {
          setEmail(data.session.user.email);
        }
      }
    };
    
    checkEmailFromSession();
  }, [location.state]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Welcome!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {email ? (
            <p>
              We've sent a verification link to <strong>{email}</strong>. 
              Please check your email and click the link to verify your account.
            </p>
          ) : (
            <p>
              Your account has been created. Please check your email for a verification link.
            </p>
          )}
          
          <p className="text-sm text-muted-foreground">
            If you don't see the email, check your spam folder or try logging in.
          </p>
          
          <div className="flex flex-col space-y-3">
            <Button onClick={() => navigate("/sign-in")}>
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
