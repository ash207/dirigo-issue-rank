
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import SendTestEmailButton from "@/components/email/SendTestEmailButton";
import UserLookupForm from "@/components/admin/UserLookupForm";
import AdminEmailSender from "@/components/admin/AdminEmailSender";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { UserManagementTable } from "@/components/admin/UserManagementTable";
import { AnalyticsTabContent } from "@/components/admin/analytics/AnalyticsTabContent";
import { GhostVotesTabContent } from "@/components/admin/GhostVotesTabContent";

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [activeTab, setActiveTab] = useState("emails");

  useEffect(() => {
    if (!isAuthenticated) {
      toast("Please sign in to access the admin dashboard");
      navigate("/sign-in");
    }
  }, [isAuthenticated, navigate]);

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        
        <Tabs defaultValue="emails" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="emails">Email Management</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="ghost-votes">Ghost Votes</TabsTrigger>
          </TabsList>
          
          <TabsContent value="emails" className="space-y-6">
            <AdminEmailSender />
            
            <Card>
              <CardHeader>
                <CardTitle>Quick Test Email</CardTitle>
                <CardDescription>
                  Send a test email to your own account to verify email functionality
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SendTestEmailButton />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Lookup</CardTitle>
                <CardDescription>
                  Look up user information by email address
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UserLookupForm />
              </CardContent>
            </Card>
            
            <UserManagementTable />
          </TabsContent>
          
          <TabsContent value="analytics" className="space-y-6">
            <AnalyticsTabContent />
          </TabsContent>
          
          <TabsContent value="ghost-votes" className="space-y-6">
            <GhostVotesTabContent />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default AdminDashboardPage;
