
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SiteIssuesTable } from "./SiteIssuesTable";
import { SiteIssueForm } from "./SiteIssueForm";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Plus } from "lucide-react";
import { useSiteIssues } from "@/hooks/useSiteIssues";

export function SiteIssuesTabContent() {
  const [showAddForm, setShowAddForm] = useState(false);
  const { siteIssues, isLoading, error, fetchIssues, addIssue, updateIssue } = useSiteIssues();

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  const handleAddIssue = async (issueData: any) => {
    await addIssue(issueData);
    setShowAddForm(false);
  };

  const handleUpdateIssue = async (issueId: string, updatedData: any) => {
    await updateIssue(issueId, updatedData);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Site Issues Tracker</h2>
        <Button 
          onClick={() => setShowAddForm(!showAddForm)}
          variant={showAddForm ? "outline" : "default"}
        >
          <Plus className="h-4 w-4 mr-2" />
          {showAddForm ? "Cancel" : "Add New Issue"}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Site Issue</CardTitle>
            <CardDescription>
              Track a new issue or bug that needs attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SiteIssueForm onSubmit={handleAddIssue} />
          </CardContent>
        </Card>
      )}

      <SiteIssuesTable 
        issues={siteIssues} 
        isLoading={isLoading} 
        onUpdateIssue={handleUpdateIssue}
      />
    </div>
  );
}
