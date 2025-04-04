
import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useReports } from "@/hooks/useReports";
import { IssueReportsTabContent } from "@/components/reports/ReportsTabContent";
import { PositionReportsTabContent } from "@/components/reports/ReportsTabContent";

const ReportsPage = () => {
  const { isAuthenticated } = useAuth();
  const { issueReports, positionReports, isLoading } = useReports();
  const [activeTab, setActiveTab] = useState("issue-reports");

  // Redirect to sign in if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/sign-in" replace />;
  }

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">Reports</h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="issue-reports">Issue Reports</TabsTrigger>
            <TabsTrigger value="position-reports">Position Reports</TabsTrigger>
          </TabsList>
          
          <TabsContent value="issue-reports">
            <IssueReportsTabContent reports={issueReports} isLoading={isLoading} />
          </TabsContent>
          
          <TabsContent value="position-reports">
            <PositionReportsTabContent reports={positionReports} isLoading={isLoading} />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default ReportsPage;
