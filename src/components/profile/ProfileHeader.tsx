
import { useState } from "react";
import { User, Pencil, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/hooks/use-toast";

type ProfileData = {
  name?: string;
  role?: string;
};

type ProfileHeaderProps = {
  profileData: ProfileData | null;
};

// Role display utilities
const getRoleBadgeVariant = (role: string) => {
  switch (role) {
    case 'dirigo_admin':
      return 'destructive';
    case 'politician_admin':
      return 'default';
    case 'moderator':
      return 'secondary';
    default:
      return 'outline';
  }
};

const getRoleDisplayName = (role: string) => {
  switch (role) {
    case 'dirigo_admin':
      return 'DirigoVotes Admin';
    case 'politician_admin':
      return 'Politician Admin';
    case 'moderator':
      return 'Moderator';
    default:
      return 'Basic User';
  }
};

export const ProfileHeader = ({ profileData }: ProfileHeaderProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  
  const handleEditProfile = () => {
    // For now, just show a toast since the edit profile functionality is not implemented
    toast({
      title: "Edit Profile",
      description: "Profile editing functionality is coming soon!",
    });
    setIsEditing(true);
    // In a real implementation, this would open a form or modal
    setTimeout(() => setIsEditing(false), 1500);
  };
  
  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="h-16 w-16 rounded-full bg-dirigo-blue flex items-center justify-center">
            <User size={32} className="text-white" />
          </div>
          <div>
            <div className="flex items-center mb-1">
              <CardTitle className="text-2xl mr-2">
                {profileData?.name || user?.email?.split('@')[0] || "User"}
              </CardTitle>
              {profileData?.role && (
                <Badge variant={getRoleBadgeVariant(profileData.role)}>
                  <Shield className="h-3 w-3 mr-1" /> 
                  {getRoleDisplayName(profileData.role)}
                </Badge>
              )}
            </div>
            <CardDescription>{user?.email}</CardDescription>
          </div>
        </div>
        <Button 
          variant="outline" 
          onClick={handleEditProfile}
          disabled={isEditing}
        >
          <Pencil className="h-4 w-4 mr-2" /> 
          {isEditing ? "Editing..." : "Edit Profile"}
        </Button>
      </CardHeader>
    </Card>
  );
};
