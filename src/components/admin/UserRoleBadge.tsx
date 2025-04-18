
import { Badge } from "@/components/ui/badge";

interface UserRoleBadgeProps {
  role: string;
}

export const UserRoleBadge = ({ role }: UserRoleBadgeProps) => {
  switch (role) {
    case "dirigo_admin":
      return <Badge className="bg-purple-100 text-purple-800 px-3 py-1">Admin</Badge>;
    case "premium":
      return <Badge className="bg-blue-100 text-blue-800 px-3 py-1">Premium</Badge>;
    case "basic":
      return <Badge className="bg-gray-100 text-gray-800 px-3 py-1">Basic</Badge>;
    default:
      return <Badge className="px-3 py-1">{role}</Badge>;
  }
};
