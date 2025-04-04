
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useIssueData } from "@/hooks/useIssueData";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const EditIssuePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { data: issue, isLoading, error } = useIssueData(id);
  
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [scope, setScope] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    // Redirect if not authenticated
    if (!isAuthenticated) {
      toast.error("Please sign in to edit issues");
      navigate("/sign-in");
    }
  }, [isAuthenticated, navigate]);
  
  useEffect(() => {
    // Check if the user is the owner of the issue
    if (user && issue && user.id !== issue.creator_id) {
      toast.error("You don't have permission to edit this issue");
      navigate(`/issues/${id}`);
    }
  }, [user, issue, navigate, id]);
  
  useEffect(() => {
    // Populate form with issue data when it loads
    if (issue) {
      setTitle(issue.title);
      setCategory(issue.category);
      setScope(issue.scope || "state");
      setDescription(issue.description);
    }
  }, [issue]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !issue) return;
    
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from("issues")
        .update({
          title,
          category,
          scope,
          description
        })
        .eq("id", id)
        .eq("creator_id", user.id);
      
      if (error) throw error;
      
      toast.success("Issue updated successfully");
      navigate(`/issues/${id}`);
    } catch (error: any) {
      console.error("Error updating issue:", error);
      toast.error("Failed to update issue");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto max-w-2xl py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-3/4 bg-gray-200 rounded"></div>
            <div className="h-64 w-full bg-gray-200 rounded"></div>
          </div>
        </div>
      </Layout>
    );
  }
  
  if (error || !issue) {
    return (
      <Layout>
        <div className="container mx-auto max-w-2xl py-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-destructive">Error</CardTitle>
              <CardDescription>
                We couldn't load this issue. It may have been deleted or you may not have permission to access it.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate("/issues")}>Back to Issues</Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="container mx-auto max-w-2xl py-8">
        <Card>
          <CardHeader>
            <CardTitle>Edit Issue</CardTitle>
            <CardDescription>
              Update your issue details below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium">
                  Issue Title
                </label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter the title of your issue"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="category" className="text-sm font-medium">
                    Category
                  </label>
                  <Input
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="E.g. Environment, Education"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="scope" className="text-sm font-medium">
                    Scope
                  </label>
                  <Select value={scope} onValueChange={setScope}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select scope" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="local">Local</SelectItem>
                      <SelectItem value="state">State</SelectItem>
                      <SelectItem value="national">National</SelectItem>
                      <SelectItem value="international">International</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">
                  Description
                </label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the issue in detail"
                  required
                  className="min-h-[200px]"
                />
              </div>
              
              <div className="flex justify-between">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate(`/issues/${id}`)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting || !title || !category || !scope || !description}
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default EditIssuePage;
