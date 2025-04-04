
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUserData } from "@/hooks/useUserData";
import { useAuth } from "@/contexts/auth";
import Layout from "@/components/layout/Layout";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileContent } from "@/components/profile/ProfileContent";
import { useToast } from "@/hooks/use-toast";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { issues, positions, profile, isLoading, isError } = useUserData();
  const { toast } = useToast();
  
  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      navigate("/sign-in");
    }
  }, [isAuthenticated, navigate]);
  
  useEffect(() => {
    // Show error toast if data fetching fails
    if (isError) {
      toast({
        title: "Error loading profile data",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  }, [isError, toast]);
  
  // Return null during redirect
  if (!isAuthenticated) {
    return null;
  }
  
  return (
    <Layout>
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <ProfileHeader profileData={profile.data} />
        <ProfileContent 
          issues={issues.data || []} 
          positions={positions.data || []} 
          isLoading={isLoading} 
        />
      </div>
    </Layout>
  );
};

export default ProfilePage;
