
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AtSign, Lock, AlertCircle, Loader2 } from "lucide-react";

interface NewSignupFormProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  confirmPassword: string;
  setConfirmPassword: (confirmPassword: string) => void;
  errorMessage: string | null;
  isLoading: boolean;
  isCheckingEmail: boolean;
  onSubmit: (e: React.FormEvent) => Promise<void>;
}

export const NewSignupForm = ({
  email,
  setEmail,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  errorMessage,
  isLoading,
  isCheckingEmail,
  onSubmit
}: NewSignupFormProps) => {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
        <CardDescription>
          Enter your email and create a secure password
        </CardDescription>
      </CardHeader>
        
      <form onSubmit={onSubmit}>
        <CardContent className="space-y-4">
          {errorMessage && (
            <div className="bg-destructive/15 text-destructive p-3 rounded-md flex items-start">
              <AlertCircle className="h-4 w-4 mt-0.5 mr-2 flex-shrink-0" />
              <p className="text-sm">{errorMessage}</p>
            </div>
          )}
            
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <AtSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="youremail@example.com"
                className="pl-9"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                disabled={isLoading || isCheckingEmail}
              />
            </div>
          </div>
            
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                className="pl-9"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                disabled={isLoading || isCheckingEmail}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Password must be at least 8 characters with numbers and uppercase letters
            </p>
          </div>
            
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <div className="relative">
              <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="confirm-password"
                type="password"
                className="pl-9"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                disabled={isLoading || isCheckingEmail}
              />
            </div>
          </div>
        </CardContent>
          
        <CardFooter className="flex flex-col space-y-4">
          <Button 
            className="w-full" 
            type="submit"
            disabled={isLoading || isCheckingEmail}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : isCheckingEmail ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Checking email...
              </>
            ) : (
              "Sign up"
            )}
          </Button>
            
          <div className="text-center text-sm">
            Already have an account?{" "}
            <a href="/sign-in" className="text-primary hover:underline">
              Log in
            </a>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
};
