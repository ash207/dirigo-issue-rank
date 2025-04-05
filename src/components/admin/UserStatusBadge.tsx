
import { Badge } from "@/components/ui/badge";

interface UserStatusBadgeProps {
  status: string;
}

export const UserStatusBadge = ({ status }: UserStatusBadgeProps) => {
  switch (status) {
    case "active":
      return <Badge className="bg-green-100 text-green-800 px-3 py-1">Active</Badge>;
    case "pending":
      return <Badge className="bg-yellow-100 text-yellow-800 px-3 py-1">Pending</Badge>;
    case "deactivated":
      return <Badge className="bg-red-100 text-red-800 px-3 py-1">Deactivated</Badge>;
    default:
      return <Badge className="px-3 py-1">{status}</Badge>;
  }
};
