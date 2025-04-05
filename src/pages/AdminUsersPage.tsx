
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserManagement } from "@/hooks/useUserManagement";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/layout/Layout";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserTable } from "@/components/admin/UserTable";
import { UserPagination } from "@/components/admin/UserPagination";
import { toast } from "sonner";

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
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'email_verification_success') {
        setLastEmailVerification(Date.now());
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/sign-in");
      return;
    }
    
    fetchUsers();
  }, [isAuthenticated, navigate, lastEmailVerification]);

  const handlePageChange = (page: number) => {
    fetchUsers(page, pagination.pageSize);
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    await updateUserRole(userId, newRole);
    // Refresh the user list to get updated data
    fetchUsers(pagination.page, pagination.pageSize);
  };

  const handleStatusChange = async (userId: string, newStatus: string) => {
    await updateUserStatus(userId, newStatus);
    // Refresh the user list to get updated data
    fetchUsers(pagination.page, pagination.pageSize);
  };

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>
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
                <div className="mt-4 flex justify-center">
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
