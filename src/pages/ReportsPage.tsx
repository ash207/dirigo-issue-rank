
import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

type IssueReport = {
  id: string;
  issue_id: string;
  issue_title: string;
  reporter_id: string;
  report_reason: string;
  status: string;
  created_at: string;
  reporter_email?: string;
};

type PositionReport = {
  id: string;
  position_id: string;
  position_title: string;
  position_content: string;
  issue_id: string | null;
  issue_title: string;
  reporter_id: string;
  report_reason: string;
  status: string;
  created_at: string;
  reporter_email?: string;
};

const ReportsPage = () => {
  const { isAuthenticated, user } = useAuth();
  const [issueReports, setIssueReports] = useState<IssueReport[]>([]);
  const [positionReports, setPositionReports] = useState<PositionReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("issue-reports");

  // Redirect to sign in if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/sign-in" replace />;
  }

  useEffect(() => {
    const fetchReports = async () => {
      setIsLoading(true);
      
      try {
        // Fetch issue reports
        const { data: issueReportsData, error: issueError } = await supabase
          .from("issue_reports")
          .select("*")
          .order("created_at", { ascending: false });
          
        if (issueError) throw issueError;
        
        // Fetch position reports
        const { data: positionReportsData, error: positionError } = await supabase
          .from("position_reports")
          .select("*")
          .order("created_at", { ascending: false });
          
        if (positionError) throw positionError;
        
        // Fetch reporter emails (in a real app, this would require admin privileges)
        const userIds = [
          ...new Set([
            ...issueReportsData.map(report => report.reporter_id),
            ...positionReportsData.map(report => report.reporter_id)
          ])
        ];
        
        if (userIds.length > 0) {
          const { data: users, error: usersError } = await supabase
            .from("profiles")
            .select("id, name")
            .in("id", userIds);
            
          if (!usersError && users) {
            const userMap = users.reduce((acc, user) => {
              acc[user.id] = user.name || 'Unknown';
              return acc;
            }, {} as Record<string, string>);
            
            // Add reporter names to reports
            setIssueReports(issueReportsData.map(report => ({
              ...report,
              reporter_email: userMap[report.reporter_id] || 'Unknown'
            })));
            
            setPositionReports(positionReportsData.map(report => ({
              ...report,
              reporter_email: userMap[report.reporter_id] || 'Unknown'
            })));
          } else {
            setIssueReports(issueReportsData);
            setPositionReports(positionReportsData);
          }
        } else {
          setIssueReports(issueReportsData);
          setPositionReports(positionReportsData);
        }
      } catch (error) {
        console.error("Error fetching reports:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "resolved":
        return <Badge variant="outline" className="bg-green-100 text-green-800">Resolved</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

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
            <Card>
              <CardHeader>
                <CardTitle>Issue Reports</CardTitle>
                <CardDescription>
                  Reports submitted by users for inappropriate issues
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : issueReports.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Issue</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Reporter</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {issueReports.map((report) => (
                        <TableRow key={report.id}>
                          <TableCell className="font-medium whitespace-nowrap">
                            {format(new Date(report.created_at), 'MMM d, yyyy')}
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {report.issue_title}
                          </TableCell>
                          <TableCell className="max-w-sm truncate">
                            {report.report_reason}
                          </TableCell>
                          <TableCell>{report.reporter_email || 'Unknown'}</TableCell>
                          <TableCell>{getStatusBadge(report.status)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No issue reports found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="position-reports">
            <Card>
              <CardHeader>
                <CardTitle>Position Reports</CardTitle>
                <CardDescription>
                  Reports submitted by users for inappropriate positions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : positionReports.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Position</TableHead>
                        <TableHead>Issue</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Reporter</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {positionReports.map((report) => (
                        <TableRow key={report.id}>
                          <TableCell className="font-medium whitespace-nowrap">
                            {format(new Date(report.created_at), 'MMM d, yyyy')}
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {report.position_title}
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {report.issue_title}
                          </TableCell>
                          <TableCell className="max-w-sm truncate">
                            {report.report_reason}
                          </TableCell>
                          <TableCell>{report.reporter_email || 'Unknown'}</TableCell>
                          <TableCell>{getStatusBadge(report.status)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No position reports found</p>
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

export default ReportsPage;
