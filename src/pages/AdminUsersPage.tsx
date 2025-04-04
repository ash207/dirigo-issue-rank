
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { useUserManagement, UserWithProfile } from "@/hooks/useUserManagement";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/layout/Layout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const AdminUsersPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { 
    users, 
    isLoading, 
    pagination, 
    fetchUsers, 
    updateUserRole, 
    updateUserStatus 
  } = useUserManagement();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/sign-in");
      return;
    }
    
    fetchUsers();
  }, [isAuthenticated, navigate]);

  const handlePageChange = (page: number) => {
    fetchUsers(page, pagination.pageSize);
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "deactivated":
        return <Badge className="bg-red-100 text-red-800">Deactivated</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const renderRoleBadge = (role: string) => {
    switch (role) {
      case "dirigo_admin":
        return <Badge className="bg-purple-100 text-purple-800">Admin</Badge>;
      case "premium":
        return <Badge className="bg-blue-100 text-blue-800">Premium</Badge>;
      case "basic":
        return <Badge className="bg-gray-100 text-gray-800">Basic</Badge>;
      default:
        return <Badge>{role}</Badge>;
    }
  };

  const renderPagination = () => {
    const { page, totalPages } = pagination;
    
    const pageItems = [];
    const maxVisiblePages = 5;
    
    // Always show first page
    pageItems.push(
      <PaginationItem key="first">
        <PaginationLink 
          onClick={() => handlePageChange(1)}
          isActive={page === 1}
        >
          1
        </PaginationLink>
      </PaginationItem>
    );
    
    // Add ellipsis if needed
    if (page > 3) {
      pageItems.push(
        <PaginationItem key="ellipsis-start">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }
    
    // Add pages around the current page
    const startPage = Math.max(2, page - 1);
    const endPage = Math.min(totalPages - 1, page + 1);
    
    for (let i = startPage; i <= endPage; i++) {
      if (i > 1 && i < totalPages) {
        pageItems.push(
          <PaginationItem key={i}>
            <PaginationLink 
              onClick={() => handlePageChange(i)}
              isActive={page === i}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }
    }
    
    // Add ellipsis if needed
    if (page < totalPages - 2) {
      pageItems.push(
        <PaginationItem key="ellipsis-end">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }
    
    // Always show last page if we have more than 1 page
    if (totalPages > 1) {
      pageItems.push(
        <PaginationItem key="last">
          <PaginationLink 
            onClick={() => handlePageChange(totalPages)}
            isActive={page === totalPages}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    return (
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              onClick={() => handlePageChange(Math.max(1, page - 1))}
              className={page === 1 ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
          
          {pageItems}
          
          <PaginationItem>
            <PaginationNext 
              onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
              className={page === totalPages ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    await updateUserRole(userId, newRole);
  };

  const handleStatusChange = async (userId: string, newStatus: string) => {
    await updateUserStatus(userId, newStatus);
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
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead>Email Verification</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user: UserWithProfile) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">
                            <div>
                              <div>{user.name || "N/A"}</div>
                              <div className="text-sm text-muted-foreground">{user.email}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {user.created_at ? format(new Date(user.created_at), 'MMM d, yyyy') : 'N/A'}
                          </TableCell>
                          <TableCell>
                            {user.email_confirmed_at ? (
                              <Badge variant="outline" className="bg-green-100 text-green-800">
                                Verified
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                                Pending
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {renderRoleBadge(user.role)}
                              <Select 
                                value={user.role} 
                                onValueChange={(value) => handleRoleChange(user.id, value)}
                              >
                                <SelectTrigger className="w-24 h-8">
                                  <SelectValue placeholder="Change" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="basic">Basic</SelectItem>
                                  <SelectItem value="premium">Premium</SelectItem>
                                  <SelectItem value="dirigo_admin">Admin</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {renderStatusBadge(user.status)}
                              <Select 
                                value={user.status} 
                                onValueChange={(value) => handleStatusChange(user.id, value)}
                              >
                                <SelectTrigger className="w-24 h-8">
                                  <SelectValue placeholder="Change" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="active">Active</SelectItem>
                                  <SelectItem value="deactivated">Deactivated</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="mt-4 flex justify-center">
                  {renderPagination()}
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
