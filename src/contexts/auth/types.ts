
import { Session, User } from '@supabase/supabase-js';

export type UserRole = 'basic' | 'moderator' | 'politician_admin' | 'dirigo_admin';

export type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<boolean>;  // Changed from Promise<void> to Promise<boolean>
  isAuthenticated: boolean;
  userRole: UserRole | null;
  isAdmin: boolean;
  isModerator: boolean;
};
