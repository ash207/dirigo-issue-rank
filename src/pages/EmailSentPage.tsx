
import { useEffect } from "react";
import { useLocation, Link, Navigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, ArrowRight, Home } from "lucide-react";

interface LocationState {
  email?: string;
}

const EmailSentPage = () => {
  const location = useLocation();
  const { email } = (location.state as LocationState) || {};

  // Logging for debugging
  useEffect(() => {
    console.log("EmailSentPage rendered with email:", email);
  }, [email]);

  // If no email is provided in the state, redirect to sign-up
  if (!email) {
    return <Navigate to="/sign-up" replace />;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-10 flex items-center justify-center">
        <Card className="w-full max-w-md shadow-lg border-border">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto bg-dirigo-blue/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <Mail className="h-8 w-8 text-dirigo-blue" />
            </div>
            <CardTitle className="text-2xl font-bold text-dirigo-blue">Check Your Email</CardTitle>
            <CardDescription className="text-base mt-2">
              We've sent a verification link to
            </CardDescription>
            <p className="font-medium text-foreground mt-1">{email}</p>
          </CardHeader>
          
          <CardContent className="pt-4 px-6">
            <div className="bg-muted rounded-lg p-4 text-sm">
              <p className="mb-2 font-medium">Please check your inbox and follow these steps:</p>
              <ol className="list-decimal pl-5 space-y-2">
                <li>Find the email from DirigioVotes</li>
                <li>Click the verification link in the email</li>
                <li>You'll be redirected back to complete your registration</li>
              </ol>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col gap-3 pt-2">
            <Button asChild variant="default" className="w-full bg-dirigo-blue hover:bg-dirigo-blue/90">
              <Link to="/sign-in" className="flex items-center justify-center">
                <span>Go to Sign In</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="w-full">
              <Link to="/" className="flex items-center justify-center">
                <Home className="mr-2 h-4 w-4" />
                <span>Return to Home</span>
              </Link>
            </Button>
            
            <p className="text-center text-sm text-muted-foreground mt-4">
              Didn't receive an email? Check your spam folder or{" "}
              <Link to="/sign-up" className="text-dirigo-blue hover:underline">
                try again
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
};

export default EmailSentPage;
