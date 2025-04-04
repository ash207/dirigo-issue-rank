
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UserStatusSelectorProps {
  currentStatus: string;
  onStatusChange: (value: string) => void;
}

export const UserStatusSelector = ({ 
  currentStatus, 
  onStatusChange 
}: UserStatusSelectorProps) => {
  return (
    <Select 
      value={currentStatus} 
      onValueChange={onStatusChange}
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
  );
};
