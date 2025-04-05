
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserManagement } from "@/hooks/useUserManagement";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/layout/Layout";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserTable } from "@/components/admin/UserTable";
import { UserPagination } from "@/components/admin/UserPagination";

const AdminUsersPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, session } = useAuth();
  const { 
    users, 
    isLoading, 
    pagination, 
    fetchUsers, 
    updateUserRole, 
    updateUserStatus 
  } = useUserManagement();
  const [lastEmailVerification, setLastEmailVerification] = useState<number>(0);

  // Listen for email verification events and refresh data
  useEffect(() => {
    // Function to handle both storage events (cross-tab) and custom events (same tab)
    const handleStorageChange = (e: StorageEvent | CustomEvent) => {
      if ((e as StorageEvent).key === 'email_verification_success' || 
          (e as CustomEvent).type === 'storage') {
        console.log("Email verification detected, refreshing users list");
        setLastEmailVerification(Date.now());
      }
    };

    // Listen for both storage events (cross-tab) and custom events (same tab)
    window.addEventListener('storage', handleStorageChange as EventListener);
    window.addEventListener('storage', handleStorageChange as EventListener);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange as EventListener);
      window.removeEventListener('storage', handleStorageChange as EventListener);
    };
  }, []);

  // Fetch users when auth state changes or after email verification
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/sign-in");
      return;
    }
    
    console.log("Fetching users list, triggered by auth change or email verification");
    fetchUsers();
  }, [isAuthenticated, navigate, lastEmailVerification, fetchUsers]);

  const handlePageChange = (page: number) => {
    fetchUsers(page, pagination.pageSize);
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    const result = await updateUserRole(userId, newRole);
    if (result) {
      // Refresh the users list to get the latest data
      fetchUsers(pagination.page, pagination.pageSize);
    }
  };

  const handleStatusChange = async (userId: string, newStatus: string) => {
    const result = await updateUserStatus(userId, newStatus);
    if (result) {
      // Refresh the users list to get the latest data
      fetchUsers(pagination.page, pagination.pageSize);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold">User Management</CardTitle>
            <CardDescription className="text-muted-foreground">
              Manage user roles and statuses. Admins can upgrade users to premium or admin roles and activate or deactivate accounts.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : (
              <>
                <UserTable 
                  users={users} 
                  handleRoleChange={handleRoleChange}
                  handleStatusChange={handleStatusChange}
                />
                <div className="mt-6 flex justify-center">
                  <UserPagination
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AdminUsersPage;
