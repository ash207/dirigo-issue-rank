
import { Badge } from "@/components/ui/badge";

interface UserStatusBadgeProps {
  status: string;
}

export const UserStatusBadge = ({ status }: UserStatusBadgeProps) => {
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
