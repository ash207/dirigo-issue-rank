
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from '@supabase/supabase-js';
import { setupAuthListener } from '@/services/auth';

export function useAuthState() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Set up auth state listener and handle initial session
  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = setupAuthListener((currentUser, currentSession) => {
      setSession(currentSession);
      setUser(currentUser);
      setLoading(false);
    });

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

  return { user, session, loading, isAuthenticated: !!user };
}
