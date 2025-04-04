
import { format } from "date-fns";
import { UserWithProfile } from "@/hooks/useUserManagement";
import { Badge } from "@/components/ui/badge";
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
  return (
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
