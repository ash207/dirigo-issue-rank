
import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from '@supabase/supabase-js';
import { useToast } from "@/hooks/use-toast";

type UserRole = 'basic' | 'moderator' | 'politician_admin' | 'dirigo_admin';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  userRole: UserRole | null;
  isAdmin: boolean;
  isModerator: boolean;
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
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const { toast } = useToast();

  const fetchUserRole = async (userId: string) => {
    try {
      console.log("Fetching user role for user:", userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching user role:', error);
        throw error;
      }
      
      if (data?.role) {
        console.log("User role:", data.role);
        setUserRole(data.role as UserRole);
      } else {
        console.log("No role found, setting to basic");
        setUserRole('basic');
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
      setUserRole('basic');
    }
  };

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log("Auth state changed:", event);
        
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          await fetchUserRole(currentSession.user.id);
        } else {
          setUserRole(null);
        }
        
        setLoading(false);
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(async ({ data: { session: currentSession } }) => {
      console.log("Existing session check:", currentSession ? "Found session" : "No session");
      
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        await fetchUserRole(currentSession.user.id);
      }
      
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

  const signUp = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Account created successfully. Please check your email for verification.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      console.log("Signing out...");
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Error signing out:", error);
        throw error;
      }
      
      // Even on successful sign out, still clear the local state
      setUser(null);
      setSession(null);
      setUserRole(null);
      
      console.log("Sign out successful");
    } catch (error: any) {
      console.error("Error in signOut function:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to sign out",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Compute admin status based on role
  const isAdmin = userRole === 'dirigo_admin' || userRole === 'politician_admin';
  
  // Compute moderator status (includes admins as well)
  const isModerator = isAdmin || userRole === 'moderator';

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        session,
        loading, 
        signIn, 
        signUp, 
        signOut,
        isAuthenticated: !!user,
        userRole,
        isAdmin,
        isModerator
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
