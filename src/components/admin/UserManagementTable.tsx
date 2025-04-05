
import { useState } from "react";
import { useUserManagement } from "@/hooks/useUserManagement";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserTable } from "@/components/admin/UserTable";
import { UserPagination } from "@/components/admin/UserPagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export const UserManagementTable = () => {
  const { 
    users, 
    isLoading, 
    pagination, 
    fetchUsers, 
    updateUserRole, 
    updateUserStatus 
  } = useUserManagement();

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchUsers(pagination.page, pagination.pageSize);
    setRefreshing(false);
  };

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
    <Card className="shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-2xl font-bold">User Management</CardTitle>
            <CardDescription className="text-muted-foreground">
              Manage user roles and statuses
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={refreshing || isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
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
  );
};
