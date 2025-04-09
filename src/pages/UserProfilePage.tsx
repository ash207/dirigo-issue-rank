
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUserProfileData } from "@/hooks/useUserProfileData";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pencil, User, Book, MessageSquare, Shield, UserCheck, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserManagement } from "@/hooks/useUserManagement";
import { toast } from "sonner";
import { manuallyConfirmUserEmail } from "@/utils/profileUtils";

const UserProfilePage = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated, session } = useAuth();
  const { profile, issues, positions, isLoading } = useUserProfileData(userId);
  const [activeTab, setActiveTab] = useState("issues");
  const [isAdmin, setIsAdmin] = useState(false);
  const [confirmingEmail, setConfirmingEmail] = useState(false);
  const { updateUserRole, updateUserStatus } = useUserManagement();
  
  // Check if current user is viewing their own profile or is an admin
  const isOwnProfile = user?.id === userId;
  const canEdit = isOwnProfile || isAdmin;
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("You must be signed in to view profiles");
      navigate("/sign-in");
    }
  }, [isAuthenticated, navigate]);
  
  // Check if user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user?.id) return;
      
      try {
        const { data } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();
        
        setIsAdmin(data?.role === "dirigo_admin");
      } catch (error) {
        console.error("Error checking admin status:", error);
      }
    };
    
    checkAdminStatus();
  }, [user]);
  
  const handleIssueClick = (issueId: string) => {
    navigate(`/issues/${issueId}`);
  };
  
  const handlePositionClick = (issueId: string) => {
    navigate(`/issues/${issueId}`);
  };
  
  const handleConfirmEmail = async () => {
    if (!userId || !session) {
      toast.error("Unable to confirm email");
      return;
    }
    
    setConfirmingEmail(true);
    
    try {
      const result = await manuallyConfirmUserEmail(userId, session);
      
      if (result.success) {
        toast.success("Email verified successfully");
      } else {
        toast.error(result.message || "Failed to verify email");
      }
    } catch (error) {
      console.error("Error confirming email:", error);
      toast.error("Failed to verify email");
    } finally {
      setConfirmingEmail(false);
    }
  };

  // Admin actions component
  const AdminActions = () => {
    if (!isAdmin || !profile.data) return null;
    
    const userData = profile.data;
    const needsEmailVerification = !userData.email_confirmed_at;
    
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Admin Actions</CardTitle>
          <CardDescription>Manage this user's account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {needsEmailVerification && (
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleConfirmEmail}
                disabled={confirmingEmail}
              >
                <UserCheck className="mr-2 h-4 w-4" />
                {confirmingEmail ? "Verifying Email..." : "Verify Email"}
              </Button>
            )}
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate("/admin/dashboard")}
            >
              <Shield className="mr-2 h-4 w-4" />
              Admin Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto max-w-6xl py-8">
          <div className="space-y-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!profile.data) {
    return (
      <Layout>
        <div className="container mx-auto max-w-6xl py-8">
          <Card>
            <CardHeader>
              <CardTitle>User Not Found</CardTitle>
              <CardDescription>The requested user profile could not be found.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-10">
              <AlertTriangle className="h-16 w-16 text-yellow-500 mb-4" />
              <p className="text-center mb-6">The user profile you're looking for doesn't exist or you don't have permission to view it.</p>
              <Button onClick={() => navigate("/")}>Return to Home</Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto max-w-6xl">
        {/* Admin Actions (only visible to admins) */}
        {isAdmin && <AdminActions />}
        
        {/* Profile Header */}
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 rounded-full bg-dirigo-blue flex items-center justify-center">
                <User size={32} className="text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">
                  {profile.data?.name || "User"}
                </CardTitle>
                <CardDescription>{profile.data?.email}</CardDescription>
                <div className="flex space-x-2 mt-2">
                  <Badge variant="outline" className={
                    profile.data?.role === 'dirigo_admin' ? 'bg-purple-100 text-purple-800' :
                    profile.data?.role === 'moderator' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }>
                    {profile.data?.role || "User"}
                  </Badge>
                  <Badge variant="outline" className={
                    profile.data?.status === 'active' ? 'bg-green-100 text-green-800' :
                    profile.data?.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    profile.data?.status === 'suspended' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }>
                    {profile.data?.status || "Pending"}
                  </Badge>
                </div>
              </div>
            </div>
            {canEdit && (
              <Button variant="outline">
                <Pencil className="h-4 w-4 mr-2" /> Edit Profile
              </Button>
            )}
          </CardHeader>
        </Card>
        
        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="issues" className="flex items-center space-x-2">
              <Book className="h-4 w-4" />
              <span>Issues ({issues.data.length})</span>
            </TabsTrigger>
            <TabsTrigger value="positions" className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4" />
              <span>Positions ({positions.data.length})</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Issues Tab Content */}
          <TabsContent value="issues">
            <Card>
              <CardHeader>
                <CardTitle>Issues Created</CardTitle>
                <CardDescription>
                  Issues created by this user on DirigoVotes.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {issues.isLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-pulse space-y-2">
                      <div className="h-6 w-64 bg-slate-200 rounded"></div>
                      <div className="h-6 w-48 bg-slate-200 rounded"></div>
                    </div>
                  </div>
                ) : issues.data.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Scope</TableHead>
                        <TableHead>Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {issues.data.map((issue) => (
                        <TableRow 
                          key={issue.id} 
                          className="cursor-pointer hover:bg-muted/60"
                          onClick={() => handleIssueClick(issue.id)}
                        >
                          <TableCell className="font-medium">{issue.title}</TableCell>
                          <TableCell>{issue.category}</TableCell>
                          <TableCell>{issue.scope || "state"}</TableCell>
                          <TableCell>{format(new Date(issue.created_at), 'MMM d, yyyy')}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <h3 className="text-lg font-medium mb-2">No issues created</h3>
                    <p className="text-muted-foreground mb-4">This user hasn't created any issues yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Positions Tab Content */}
          <TabsContent value="positions">
            <Card>
              <CardHeader>
                <CardTitle>Positions Taken</CardTitle>
                <CardDescription>
                  Positions this user has taken on various issues.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {positions.isLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-pulse space-y-2">
                      <div className="h-6 w-64 bg-slate-200 rounded"></div>
                      <div className="h-6 w-48 bg-slate-200 rounded"></div>
                    </div>
                  </div>
                ) : positions.data.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Position Title</TableHead>
                        <TableHead>Issue</TableHead>
                        <TableHead>Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {positions.data.map((position) => (
                        <TableRow 
                          key={position.id}
                          className="cursor-pointer hover:bg-muted/60"
                          onClick={() => handlePositionClick(position.issue_id)}
                        >
                          <TableCell className="font-medium">{position.title}</TableCell>
                          <TableCell>{position.issues?.title}</TableCell>
                          <TableCell>{format(new Date(position.created_at), 'MMM d, yyyy')}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <h3 className="text-lg font-medium mb-2">No positions taken</h3>
                    <p className="text-muted-foreground mb-4">This user hasn't taken any positions on issues yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default UserProfilePage;
