
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CardContent, CardFooter } from "@/components/ui/card";
import { AtSign, Lock, AlertCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Define form validation schema
const signUpSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type SignUpFormValues = z.infer<typeof signUpSchema>;

interface SignUpFormProps {
  onTimeoutError: () => void;
}

export const SignUpForm = ({ onTimeoutError }: SignUpFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signUp } = useAuth();
  const navigate = useNavigate();
  
  // Set up form with validation
  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: SignUpFormValues) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`Attempting to sign up user: ${values.email}`);
      
      await signUp(values.email, values.password);
      console.log(`Signup request completed for ${values.email}`);
      // Success message will be shown by the AuthContext
      // The navigation should now happen in the AuthContext's signUp function
    } catch (error: any) {
      console.error("Sign-up error:", error);
      
      // Log detailed error info for debugging
      if (error.code || error.status || error.message) {
        console.log("Error details:", {
          code: error.code || 'undefined',
          message: error.message || 'undefined',
          status: error.status || 'undefined'
        });
      }
      
      // Handle specific error cases
      if (error.code === "potential_success_with_timeout") {
        console.log("Detected potential successful signup despite timeout");
        setError(error.message);
        onTimeoutError();
        return;
      }
      
      if (error.message?.includes("timeout") || error.message?.includes("gateway") || 
          error.status === 504) {
        console.log("Detected timeout or gateway error");
        setError("The server is currently busy. This doesn't mean your account wasn't created. Please check your email or try signing in with the credentials you just entered.");
        onTimeoutError();
      } else if (error.message?.includes("already") || error.message?.includes("exists")) {
        setError("An account with this email already exists. Please try signing in instead.");
      } else if (error.message) {
        setError(error.message);
      } else {
        setError("Failed to create account. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive" className="flex items-start">
              <AlertCircle className="h-4 w-4 mt-0.5 mr-2 flex-shrink-0" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel>Email</FormLabel>
                <div className="relative">
                  <AtSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <FormControl>
                    <Input
                      placeholder="youremail@example.com"
                      className="pl-9"
                      {...field}
                    />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel>Password</FormLabel>
                <div className="relative">
                  <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <FormControl>
                    <Input
                      type="password"
                      className="pl-9"
                      {...field}
                    />
                  </FormControl>
                </div>
                <p className="text-xs text-muted-foreground">Password must be at least 6 characters long</p>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-4">
          <Button 
            className="w-full bg-dirigo-blue" 
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Creating account..." : "Sign up"}
          </Button>
          <div className="text-center text-sm">
            Already have an account?{" "}
            <Link to="/sign-in" className="text-dirigo-blue hover:underline">
              Sign in
            </Link>
          </div>
        </CardFooter>
      </form>
    </Form>
  );
};
