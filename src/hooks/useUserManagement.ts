import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type UserWithProfile = {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  email_confirmed_at: string | null;
  role: string;
  status: string;
  name: string | null;
};

export const useUserManagement = () => {
  const [users, setUsers] = useState<UserWithProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0
  });
  const { session } = useAuth();

  const fetchUsers = async (page = 1, pageSize = 10) => {
    if (!session?.access_token) {
      toast.error("Authentication required");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("list-users", {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        },
        body: {
          page,
          pageSize
        }
      });

      if (error) throw error;

      setUsers(data.users);
      setPagination({
        page: data.page,
        pageSize: data.pageSize,
        total: data.total,
        totalPages: data.totalPages
      });
    } catch (error: any) {
      console.error("Error fetching users:", error);
      toast.error(error.message || "Failed to fetch users");
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserRole = async (userId: string, role: string) => {
    if (!session?.access_token) {
      toast.error("Authentication required");
      return false;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("manage-user", {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        },
        body: {
          userId,
          action: "updateRole",
          value: role
        }
      });

      if (error) throw error;

      setUsers(prev => 
        prev.map(user => 
          user.id === userId ? { ...user, role } : user
        )
      );
      
      toast.success("User role updated successfully");
      return true;
    } catch (error: any) {
      console.error("Error updating user role:", error);
      toast.error(error.message || "Failed to update user role");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserStatus = async (userId: string, status: string) => {
    if (!session?.access_token) {
      toast.error("Authentication required");
      return false;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("manage-user", {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        },
        body: {
          userId,
          action: "updateStatus",
          value: status
        }
      });

      if (error) throw error;

      setUsers(prev => 
        prev.map(user => 
          user.id === userId ? { ...user, status } : user
        )
      );
      
      toast.success("User status updated successfully");
      return true;
    } catch (error: any) {
      console.error("Error updating user status:", error);
      toast.error(error.message || "Failed to update user status");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    users,
    isLoading,
    pagination,
    fetchUsers,
    updateUserRole,
    updateUserStatus
  };
};
