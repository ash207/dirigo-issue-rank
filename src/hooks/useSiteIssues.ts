
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type SiteIssue = {
  id: string;
  title: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "open" | "in-progress" | "resolved";
  component?: string;
  reporter_id?: string;
  created_at: string;
  updated_at?: string;
  deleted?: boolean;
};

export function useSiteIssues() {
  const [siteIssues, setSiteIssues] = useState<SiteIssue[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchIssues = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from("site_issues")
        .select("*")
        .eq("deleted", false)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setSiteIssues(data || []);
    } catch (err: any) {
      console.error("Error fetching site issues:", err);
      setError(err.message || "Failed to load site issues");
      toast.error("Failed to load site issues");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addIssue = useCallback(async (issueData: Partial<SiteIssue>) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from("site_issues")
        .insert([
          {
            ...issueData,
            reporter_id: (await supabase.auth.getUser()).data.user?.id,
            deleted: false
          }
        ])
        .select();

      if (error) throw error;

      setSiteIssues((prev) => [data[0], ...prev]);
      toast.success("Issue added successfully");
      return data[0];
    } catch (err: any) {
      console.error("Error adding site issue:", err);
      setError(err.message || "Failed to add site issue");
      toast.error("Failed to add site issue");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateIssue = useCallback(async (issueId: string, updateData: Partial<SiteIssue>) => {
    setIsLoading(true);
    setError(null);

    try {
      if (updateData.deleted) {
        // Handle soft delete
        const { error } = await supabase
          .from("site_issues")
          .update({ deleted: true, updated_at: new Date().toISOString() })
          .eq("id", issueId);

        if (error) throw error;

        setSiteIssues((prev) => prev.filter((issue) => issue.id !== issueId));
        toast.success("Issue deleted successfully");
      } else {
        // Handle update
        const { data, error } = await supabase
          .from("site_issues")
          .update({ ...updateData, updated_at: new Date().toISOString() })
          .eq("id", issueId)
          .select();

        if (error) throw error;

        setSiteIssues((prev) =>
          prev.map((issue) => (issue.id === issueId ? { ...issue, ...data[0] } : issue))
        );
        toast.success("Issue updated successfully");
      }
    } catch (err: any) {
      console.error("Error updating site issue:", err);
      setError(err.message || "Failed to update site issue");
      toast.error("Failed to update site issue");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    siteIssues,
    isLoading,
    error,
    fetchIssues,
    addIssue,
    updateIssue,
  };
}
