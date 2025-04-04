
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from './types';

export const useUserRole = () => {
  const [userRole, setUserRole] = useState<UserRole | null>(null);

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

  return {
    userRole,
    setUserRole,
    fetchUserRole
  };
};
