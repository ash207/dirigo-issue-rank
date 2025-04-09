
import { format } from "date-fns";
import { UserWithProfile } from "@/hooks/useUserManagement";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { manuallyConfirmUserEmail } from "@/utils/profileUtils";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
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
import { ExternalLink } from "lucide-react";

interface UserTableProps {
  users: UserWithProfile[];
  handleRoleChange: (userId: string, newRole: string) => Promise<void>;
  handleStatusChange: (userId: string, newStatus: string) => Promise<void>;
  refreshUsers: () => Promise<void>;
}

export const UserTable = ({ 
  users, 
  handleRoleChange, 
  handleStatusChange,
  refreshUsers
}: UserTableProps) => {
  const [confirmingUser, setConfirmingUser] = useState<string | null>(null);
  const { session } = useAuth();

  // Listen for email verification events
  useEffect(() => {
    const handleEmailVerification = () => {
      console.log("Email verification event detected, refreshing users list");
      refreshUsers();
    };

    // Listen for the custom event
    window.addEventListener('custom-email-verification', handleEmailVerification);
    
    // Also listen for storage events (for cross-tab notifications)
    const handleStorageEvent = (event: StorageEvent | CustomEvent) => {
      if ('detail' in event) {
        // This is the CustomEvent from the same tab
        const detail = (event as CustomEvent).detail;
        if (detail?.key === 'email_verification_success') {
          console.log("Email verification storage event detected (same tab)");
          refreshUsers();
        }
      } else {
        // This is a StorageEvent from another tab
        const storageEvent = event as StorageEvent;
        if (storageEvent.key === 'email_verification_success') {
          console.log("Email verification storage event detected (cross-tab)");
          refreshUsers();
        }
      }
    };

    window.addEventListener('storage', handleStorageEvent as EventListener);

    return () => {
      window.removeEventListener('custom-email-verification', handleEmailVerification);
      window.removeEventListener('storage', handleStorageEvent as EventListener);
    };
  }, [refreshUsers]);

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
        window.dispatchEvent(new CustomEvent('custom-email-verification', { 
          detail: { key: 'email_verification_success' } 
        }));
        
        // Also refresh immediately
        await refreshUsers();
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
                <div className="flex flex-col">
                  <div className="font-medium flex items-center">
                    {user.name || "N/A"}
                    <Link to={`/profile/${user.id}`} className="ml-1 text-blue-600 hover:text-blue-800">
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
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
          {users.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                No users found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
