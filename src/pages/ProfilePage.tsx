
import { useNavigate } from "react-router-dom";
import { useUserData } from "@/hooks/useUserData";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/layout/Layout";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileContent } from "@/components/profile/ProfileContent";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { issues, positions, profile, isLoading } = useUserData();
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    navigate("/sign-in");
    return null;
  }
  
  return (
    <Layout>
      <div className="container mx-auto max-w-6xl">
        <ProfileHeader profileData={profile.data} />
        <ProfileContent 
          issues={issues.data} 
          positions={positions.data} 
          isLoading={isLoading} 
        />
      </div>
    </Layout>
  );
};

export default ProfilePage;
