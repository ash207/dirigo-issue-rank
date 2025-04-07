
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserData } from "@/hooks/useUserData";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pencil, User, Book, MessageSquare } from "lucide-react";
import { format } from "date-fns";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { issues, positions, profile, isLoading } = useUserData();
  const [activeTab, setActiveTab] = useState("issues");
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    navigate("/sign-in");
    return null;
  }
  
  const handleIssueClick = (issueId: string) => {
    navigate(`/issues/${issueId}`);
  };
  
  const handlePositionClick = (issueId: string) => {
    navigate(`/issues/${issueId}`);
  };

  return (
    <Layout>
      <div className="container mx-auto max-w-6xl">
        {/* Profile Header */}
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 rounded-full bg-dirigo-blue flex items-center justify-center">
                <User size={32} className="text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">
                  {profile.data?.name || user?.email?.split('@')[0] || "User"}
                </CardTitle>
                <CardDescription>{user?.email}</CardDescription>
              </div>
            </div>
            <Button variant="outline">
              <Pencil className="h-4 w-4 mr-2" /> Edit Profile
            </Button>
          </CardHeader>
        </Card>
        
        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="issues" className="flex items-center space-x-2">
              <Book className="h-4 w-4" />
              <span>My Issues ({issues.data.length})</span>
            </TabsTrigger>
            <TabsTrigger value="positions" className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4" />
              <span>My Positions ({positions.data.length})</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Issues Tab Content */}
          <TabsContent value="issues">
            <Card>
              <CardHeader>
                <CardTitle>Issues Created</CardTitle>
                <CardDescription>
                  These are all the issues you have created on DirigoVotes.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
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
                    <h3 className="text-lg font-medium mb-2">No issues created yet</h3>
                    <p className="text-muted-foreground mb-4">Create your first issue to see it here</p>
                    <Button onClick={() => navigate("/issues/create")}>
                      Create an Issue
                    </Button>
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
                  These are all the positions you have taken on various issues.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
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
                    <h3 className="text-lg font-medium mb-2">No positions taken yet</h3>
                    <p className="text-muted-foreground mb-4">Take a position on an issue to see it here</p>
                    <Button onClick={() => navigate("/issues")}>
                      Browse Issues
                    </Button>
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

export default ProfilePage;
