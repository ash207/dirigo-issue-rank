
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UserRoleSelectorProps {
  currentRole: string;
  onRoleChange: (value: string) => void;
}

export const UserRoleSelector = ({ 
  currentRole, 
  onRoleChange 
}: UserRoleSelectorProps) => {
  return (
    <Select 
      value={currentRole} 
      onValueChange={onRoleChange}
    >
      <SelectTrigger className="w-28 h-8 bg-white">
        <SelectValue placeholder="Change" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="basic">Basic</SelectItem>
        <SelectItem value="premium">Premium</SelectItem>
        <SelectItem value="dirigo_admin">Admin</SelectItem>
      </SelectContent>
    </Select>
  );
};
