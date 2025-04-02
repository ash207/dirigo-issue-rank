
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Layout from "@/components/layout/Layout";
import IssueCard from "@/components/issues/IssueCard";
import IssueFilter from "@/components/issues/IssueFilter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const IssuesPage = () => {
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [verificationFilter, setVerificationFilter] = useState("all");
  
  // Fetch all issues
  const issuesQuery = useQuery({
    queryKey: ["issues"],
    queryFn: async () => {
      try {
        // First, get all issues
        const { data: issuesData, error: issuesError } = await supabase
          .from("issues")
          .select("*, positions(id)")
          .order("created_at", { ascending: false });
        
        if (issuesError) throw issuesError;
        
        // For each issue, fetch the creator's name
        const issuesWithCreators = await Promise.all(issuesData.map(async (issue) => {
          let creatorName = "Anonymous";
          
          if (issue.creator_id) {
            const { data: creatorData, error: creatorError } = await supabase
              .from("profiles")
              .select("name")
              .eq("id", issue.creator_id)
              .single();
              
            if (!creatorError && creatorData) {
              creatorName = creatorData.name || "Anonymous";
            }
          }
          
          return {
            id: issue.id,
            title: issue.title,
            category: issue.category,
            votes: issue.positions?.length || 0,
            positions: issue.positions?.length || 0,
            creator: creatorName
          };
        }));
        
        return issuesWithCreators;
      } catch (error) {
        console.error("Error fetching issues:", error);
        throw error;
      }
    }
  });

  // Filter issues based on search query and filters
  const filteredIssues = issuesQuery.data?.filter(issue => {
    const matchesSearch = searchQuery ? 
      issue.title.toLowerCase().includes(searchQuery.toLowerCase()) : true;
    
    const matchesCategory = categoryFilter !== "all" ? 
      issue.category.toLowerCase() === categoryFilter.toLowerCase() : true;
    
    // Verification filter would be implemented here if we had that data
    
    return matchesSearch && matchesCategory;
  }) || [];

  // Handle filter changes
  const handleFilterChange = (category: string, verification: string) => {
    setCategoryFilter(category);
    setVerificationFilter(verification);
  };

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The filtering happens automatically via the filteredIssues derived state
  };

  // Handle errors
  useEffect(() => {
    if (issuesQuery.error) {
      toast.error("Failed to load issues");
      console.error("Issues query error:", issuesQuery.error);
    }
  }, [issuesQuery.error]);

  return (
    <Layout>
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Browse Issues</h1>
          
          {isAuthenticated && (
            <Link to="/issues/create">
              <Button className="bg-dirigo-blue">
                <Plus size={18} className="mr-2" /> Create Issue
              </Button>
            </Link>
          )}
        </div>
        
        {/* Search and filter section */}
        <div className="mb-8">
          <form onSubmit={handleSearch} className="flex gap-2 mb-4">
            <Input
              placeholder="Search issues..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" className="bg-dirigo-blue">
              <Search size={18} className="mr-2" /> Search
            </Button>
          </form>
          
          <IssueFilter onFilterChange={handleFilterChange} />
        </div>
        
        {/* Show loading state */}
        {issuesQuery.isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-40 bg-slate-200 rounded-lg mb-2"></div>
                <div className="h-6 bg-slate-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-slate-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        )}
        
        {/* Show issues */}
        {!issuesQuery.isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredIssues.map(issue => (
              <IssueCard key={issue.id} {...issue} />
            ))}
          </div>
        )}

        {!issuesQuery.isLoading && filteredIssues.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-xl font-medium mb-2">No issues found</h3>
            <p className="text-muted-foreground">Try adjusting your filters or search query</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default IssuesPage;
