
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export type IssueReport = {
  id: string;
  issue_id: string;
  issue_title: string;
  reporter_id: string;
  report_reason: string;
  status: string;
  created_at: string;
  reporter_email?: string;
};

export type PositionReport = {
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

export const useReports = () => {
  const [issueReports, setIssueReports] = useState<IssueReport[]>([]);
  const [positionReports, setPositionReports] = useState<PositionReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  return {
    issueReports,
    positionReports,
    isLoading
  };
};
