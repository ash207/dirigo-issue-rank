
import { format } from "date-fns";
import { UserWithProfile } from "@/hooks/useUserManagement";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";
import { manuallyConfirmUserEmail } from "@/utils/profileUtils";
import { useAuth } from "@/contexts/AuthContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserRoleSelector } from "./UserRoleSelector";
import { UserStatusSelector } from "./UserStatusSelector";
import { UserStatusBadge } from "./UserStatusBadge";
import { UserRoleBadge } from "./UserRoleBadge";

interface UserTableProps {
  users: UserWithProfile[];
  handleRoleChange: (userId: string, newRole: string) => Promise<void>;
  handleStatusChange: (userId: string, newStatus: string) => Promise<void>;
}

export const UserTable = ({ 
  users, 
  handleRoleChange, 
  handleStatusChange 
}: UserTableProps) => {
  const [confirmingUser, setConfirmingUser] = useState<string | null>(null);
  const { session } = useAuth();

  const handleConfirmEmail = async (userId: string, email: string) => {
    if (!session) {
      toast.error("You must be logged in to perform this action");
      return;
    }
    
    setConfirmingUser(userId);
    
    try {
      const result = await manuallyConfirmUserEmail(userId, session);
      
      if (result.success) {
        toast.success(`Email verified for ${email}`);
        // Dispatch a custom event to trigger a refresh of the users list
        window.dispatchEvent(new CustomEvent('storage', { detail: { key: 'email_verification_success' } }));
      } else {
        toast.error(result.message || "Failed to verify email");
      }
    } catch (error) {
      console.error("Error confirming email:", error);
      toast.error("Failed to verify email");
    } finally {
      setConfirmingUser(null);
    }
  };
  
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[250px]">User</TableHead>
            <TableHead className="w-[120px]">Joined</TableHead>
            <TableHead className="w-[180px]">Email Verification</TableHead>
            <TableHead className="w-[180px]">Role</TableHead>
            <TableHead className="w-[180px]">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user: UserWithProfile) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">
                <div>
                  <div className="font-medium">{user.name || "N/A"}</div>
                  <div className="text-sm text-muted-foreground truncate max-w-[230px]">{user.email}</div>
                </div>
              </TableCell>
              <TableCell>
                {user.created_at ? format(new Date(user.created_at), 'MMM d, yyyy') : 'N/A'}
              </TableCell>
              <TableCell>
                {user.email_confirmed_at ? (
                  <div className="w-full flex justify-start">
                    <Badge variant="outline" className="bg-green-100 text-green-800 px-3 py-1">
                      Verified
                    </Badge>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 items-start">
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800 px-3 py-1">
                      Pending
                    </Badge>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => handleConfirmEmail(user.id, user.email)}
                      disabled={confirmingUser === user.id}
                    >
                      {confirmingUser === user.id ? "Verifying..." : "Verify Email"}
                    </Button>
                  </div>
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <UserRoleBadge role={user.role} />
                  <UserRoleSelector 
                    currentRole={user.role} 
                    onRoleChange={(value) => handleRoleChange(user.id, value)} 
                  />
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <UserStatusBadge status={user.status} />
                  <UserStatusSelector 
                    currentStatus={user.status} 
                    onStatusChange={(value) => handleStatusChange(user.id, value)} 
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
