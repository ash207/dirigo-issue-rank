
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AtSign, Lock, AlertCircle, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Define the SignupState enum since AuthService was removed
export enum SignupState {
  IDLE = "idle",
  CHECKING_EMAIL = "checking_email",
  CREATING_USER = "creating_user",
  SUCCESS = "success",
  ERROR = "error"
}

// Define form validation schema
const signUpSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignUpFormValues = z.infer<typeof signUpSchema>;

interface CleanSignupFormProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  confirmPassword: string;
  setConfirmPassword: (confirmPassword: string) => void;
  error: string | null;
  state: SignupState;
  isCheckingEmail: boolean;
  isCreatingUser: boolean;
  handleSignup: () => void;
}

export const CleanSignupForm = ({
  email,
  setEmail,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  error,
  state,
  isCheckingEmail,
  isCreatingUser,
  handleSignup
}: CleanSignupFormProps) => {
  // Set up form with validation
  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: email,
      password: password,
      confirmPassword: confirmPassword,
    },
  });

  // Update external state when form values change
  const onValuesChange = (values: Partial<SignUpFormValues>) => {
    if (values.email !== undefined) setEmail(values.email);
    if (values.password !== undefined) setPassword(values.password);
    if (values.confirmPassword !== undefined) setConfirmPassword(values.confirmPassword);
  };

  const onSubmit = (values: SignUpFormValues) => {
    // Update external state before submitting
    setEmail(values.email);
    setPassword(values.password);
    setConfirmPassword(values.confirmPassword);
    
    // Call the handleSignup function
    handleSignup();
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Create an account</CardTitle>
        <CardDescription>
          Enter your information to create an account
        </CardDescription>
      </CardHeader>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} onChange={e => onValuesChange(form.getValues())}>
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
            
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Confirm Password</FormLabel>
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
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              className="w-full bg-dirigo-blue" 
              type="submit"
              disabled={isCheckingEmail || isCreatingUser}
            >
              {isCheckingEmail ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Checking email...
                </>
              ) : isCreatingUser ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Sign up"
              )}
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
    </Card>
  );
};
