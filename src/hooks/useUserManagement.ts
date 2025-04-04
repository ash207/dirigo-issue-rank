
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

export type UserPagination = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

// Separate hook for user listing and pagination
export const useUserList = () => {
  const [users, setUsers] = useState<UserWithProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState<UserPagination>({
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

  return {
    users,
    isLoading,
    pagination,
    fetchUsers,
    setUsers
  };
};

// Separate hook for user role management
export const useUserRoleManagement = (setUsers: React.Dispatch<React.SetStateAction<UserWithProfile[]>>) => {
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);
  const { session } = useAuth();

  const updateUserRole = async (userId: string, role: string) => {
    if (!session?.access_token) {
      toast.error("Authentication required");
      return false;
    }

    setIsUpdatingRole(true);
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
      setIsUpdatingRole(false);
    }
  };

  return {
    isUpdatingRole,
    updateUserRole
  };
};

// Separate hook for user status management
export const useUserStatusManagement = (setUsers: React.Dispatch<React.SetStateAction<UserWithProfile[]>>) => {
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const { session } = useAuth();

  const updateUserStatus = async (userId: string, status: string) => {
    if (!session?.access_token) {
      toast.error("Authentication required");
      return false;
    }

    setIsUpdatingStatus(true);
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
      setIsUpdatingStatus(false);
    }
  };

  return {
    isUpdatingStatus,
    updateUserStatus
  };
};

// Main hook that composes the functionality
export const useUserManagement = () => {
  const { users, isLoading, pagination, fetchUsers, setUsers } = useUserList();
  const { updateUserRole } = useUserRoleManagement(setUsers);
  const { updateUserStatus } = useUserStatusManagement(setUsers);

  return {
    users,
    isLoading,
    pagination,
    fetchUsers,
    updateUserRole,
    updateUserStatus
  };
};
