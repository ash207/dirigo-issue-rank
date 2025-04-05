
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CardContent, CardFooter } from "@/components/ui/card";
import { AtSign, Lock, AlertCircle, Loader2 } from "lucide-react";

interface EmailSignInFormProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  error: string | null;
  isLoading: boolean;
  onSubmit: () => Promise<void>;
}

export function EmailSignInForm({
  email,
  setEmail,
  password,
  setPassword,
  error,
  isLoading,
  onSubmit
}: EmailSignInFormProps) {
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
              disabled={isLoading}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link to="/forgot-password" className="text-sm text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              type="password"
              className="pl-9"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              disabled={isLoading}
            />
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-col space-y-4">
        <Button 
          className="w-full" 
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign in"
          )}
        </Button>
        
        <div className="text-center text-sm">
          Don't have an account?{" "}
          <Link to="/email-signup" className="text-primary hover:underline">
            Sign up
          </Link>
        </div>
      </CardFooter>
    </form>
  );
}
