
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CardContent, CardFooter } from "@/components/ui/card";
import { AtSign, Lock, AlertCircle, Loader2 } from "lucide-react";

interface EmailSignUpFormProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  confirmPassword: string;
  setConfirmPassword: (confirmPassword: string) => void;
  error: string | null;
  isLoading: boolean;
  isCheckingEmail: boolean;
  onSubmit: () => Promise<void>;
}

export function EmailSignUpForm({
  email,
  setEmail,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  error,
  isLoading,
  isCheckingEmail,
  onSubmit
}: EmailSignUpFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardContent className="space-y-4">
        {error && (
          <div className="bg-destructive/15 text-destructive p-3 rounded-md flex items-start">
            <AlertCircle className="h-4 w-4 mt-0.5 mr-2 flex-shrink-0" />
            <p className="text-sm">{error}</p>
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
            Password must be at least 6 characters
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
          <Link to="/email-signin" className="text-primary hover:underline">
            Sign in
          </Link>
        </div>
      </CardFooter>
    </form>
  );
}
