import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Session, User, AuthError } from '@supabase/supabase-js';
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from 'react-router-dom';

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
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Update user profile status when email is confirmed
  const updateUserStatusIfVerified = async (currentUser: User | null) => {
    if (!currentUser) return;
    
    // Check if email is confirmed
    if (currentUser.email_confirmed_at) {
      try {
        // Check current status
        const { data: profile, error: fetchError } = await supabase
          .from('profiles')
          .select('status')
          .eq('id', currentUser.id)
          .single();
          
        if (fetchError) throw fetchError;
        
        // If status is still pending but email is confirmed, update to active
        if (profile?.status === 'pending') {
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ status: 'active' })
            .eq('id', currentUser.id);
            
          if (updateError) throw updateError;
          
          console.log('User status updated to active after email verification');
        }
      } catch (error) {
        console.error('Error updating user status:', error);
      }
    }
  };

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        // Check email verification for any auth state change that has a user
        if (currentSession?.user) {
          updateUserStatusIfVerified(currentSession.user);
        }
        
        setLoading(false);
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "You have successfully signed in",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to sign in",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Helper function to wait a specified time
  const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // Improved sign-up function with better timeout handling
  const signUp = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // Set a timeout for the entire operation
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Request timed out after 10 seconds")), 10000);
      });
      
      // Create the actual signup promise with proper options
      const signUpPromise = supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin + '/verify',
          // Set explicit timeouts for Supabase client requests
          captchaTimeout: 8000,
          flowType: "pkce" // Use PKCE flow for better reliability
        }
      });
      
      // Race the signup against the timeout
      const { data, error } = await Promise.race([
        signUpPromise,
        timeoutPromise.then(() => {
          throw new Error("The server is busy. Please try again or check your email for a verification link.");
        })
      ]) as any;
      
      if (error) {
        throw error;
      }

      // Check if the user was actually created
      if (data?.user) {
        toast({
          title: "Account Created",
          description: "Please check your email for a verification link.",
        });
      } else {
        throw new Error("Failed to create account. Please try again.");
      }
    } catch (error: any) {
      console.error("Signup error details:", error);
      
      // Handle specific error cases with improved messaging
      let errorMessage = "Failed to create account";
      
      if (error.code === "over_email_send_rate_limit") {
        errorMessage = "Too many sign-up attempts. Please try again later.";
      } else if (error.status === 504 || error.message?.includes("timeout") || 
                error.message?.includes("gateway") || error.message?.includes("timed out")) {
        errorMessage = "The server is busy. Your account may have been created. Please check your email or try signing in.";
      } else if (error.message?.includes("already") || error.message?.includes("exists")) {
        errorMessage = "An account with this email already exists. Please try signing in.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Signed out",
        description: "You have been signed out successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to sign out",
        variant: "destructive",
      });
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        session,
        loading, 
        signIn, 
        signUp, 
        signOut,
        isAuthenticated: !!user 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
