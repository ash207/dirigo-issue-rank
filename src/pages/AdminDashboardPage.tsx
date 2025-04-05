
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import SendTestEmailButton from "@/components/email/SendTestEmailButton";
import UserLookupForm from "@/components/admin/UserLookupForm";
import { useEffect } from "react";
import { toast } from "sonner";

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      toast("Please sign in to access the admin dashboard");
      navigate("/sign-in");
    }
  }, [isAuthenticated, navigate]);

  return (
    <Layout>
      <div className="container mx-auto py-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Email Testing</CardTitle>
            <CardDescription>
              Send a test email to your account to verify email functionality
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SendTestEmailButton />
          </CardContent>
        </Card>

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
      </div>
    </Layout>
  );
};

export default AdminDashboardPage;
