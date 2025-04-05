
import React, { createContext, useState, useContext, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { useToast } from "@/hooks/use-toast";
import { useAuthState } from '@/hooks/useAuthState';
import { signIn, signOut, signUp, setupAuthListener } from '@/services/auth';
import { updateUserStatusIfVerified } from '@/utils/profileUtils';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, session, loading, isAuthenticated } = useAuthState();
  const { toast } = useToast();

  // Effect to update profile status when user changes
  useEffect(() => {
    if (user) {
      // Defer this to avoid auth state change callback conflicts
      setTimeout(() => {
        updateUserStatusIfVerified(user);
      }, 0);
    }
  }, [user]);

  const handleSignIn = async (email: string, password: string) => {
    try {
      await signIn(
        email, 
        password,
        () => {
          toast({
            title: "Success",
            description: "You have successfully signed in",
          });
        },
        (error) => {
          toast({
            title: "Error",
            description: error.message || "Failed to sign in",
            variant: "destructive",
          });
        }
      );
    } catch (error) {
      // Error is already handled in the signIn function
      console.error("Sign-in error caught in context:", error);
    }
  };

  const handleSignUp = async (email: string, password: string) => {
    try {
      const redirectUrl = window.location.origin + '/verify';
      console.log(`Signup initiated with redirect URL: ${redirectUrl}`);
      
      await signUp(
        email, 
        password,
        redirectUrl,
        (data) => {
          console.log("Signup success in context:", data?.user?.id);
          toast({
            title: "Account Created",
            description: "Please check your email for a verification link.",
          });
        },
        (error) => {
          console.error("Signup error in context:", error);
          toast({
            title: "Error",
            description: error.message || "Failed to create account",
            variant: "destructive",
          });
        }
      );
    } catch (error) {
      // Error is already handled in the signUp function
      console.error("Unexpected error in signup context handler:", error);
    }
  };

  const handleSignOut = async () => {
    await signOut(
      () => {
        toast({
          title: "Signed out",
          description: "You have been signed out successfully",
        });
      },
      (error) => {
        toast({
          title: "Error",
          description: error.message || "Failed to sign out",
          variant: "destructive",
        });
      }
    );
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        session,
        loading, 
        signIn: handleSignIn, 
        signUp: handleSignUp, 
        signOut: handleSignOut,
        isAuthenticated 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
