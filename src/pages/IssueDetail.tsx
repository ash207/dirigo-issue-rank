
import { useParams, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/contexts/AuthContext";
import IssueHeader from "@/components/issues/IssueHeader";
import PositionsList from "@/components/positions/PositionsList";
import usePositionVotes from "@/hooks/usePositionVotes";

const IssueDetail = () => {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuth();
  const { userVotedPosition, positionVotes, handleVote } = usePositionVotes(id, user?.id, isAuthenticated);
  const [loading, setLoading] = useState(true);

  // Fetch issue details
  const issueQuery = useQuery({
    queryKey: ["issue", id],
    queryFn: async () => {
      if (!id) throw new Error("Issue ID is required");
      
      const { data, error } = await supabase
        .from("issues")
        .select("*")
        .eq("id", id)
        .single();
      
      if (error) throw error;

      // Fetch creator name if available
      let creatorName = "Anonymous";
      if (data.creator_id) {
        const { data: creatorData, error: creatorError } = await supabase
          .from("profiles")
          .select("name")
          .eq("id", data.creator_id)
          .single();
        
        if (!creatorError && creatorData) {
          creatorName = creatorData.name || "Anonymous";
        }
      }
      
      return {
        ...data,
        creatorName
      };
    },
    enabled: !!id,
  });

  // Fetch positions for this issue
  const positionsQuery = useQuery({
    queryKey: ["positions", id],
    queryFn: async () => {
      if (!id) throw new Error("Issue ID is required");
      
      console.log("Fetching positions for issue:", id);
      
      const { data, error } = await supabase
        .from("positions")
        .select("*")
        .eq("issue_id", id)
        .order("votes", { ascending: false });
      
      if (error) {
        console.error("Error fetching positions:", error);
        throw error;
      }
      
      console.log("Positions raw data:", data);

      // Transform the data to match the expected format
      const transformedData = await Promise.all(data.map(async position => {
        // Fetch author name if available
        let authorName = "Anonymous";
        if (position.author_id) {
          const { data: authorData, error: authorError } = await supabase
            .from("profiles")
            .select("name")
            .eq("id", position.author_id)
            .single();
          
          if (!authorError && authorData) {
            authorName = authorData.name || "Anonymous";
          }
        }

        return {
          id: position.id,
          title: position.title,
          content: position.content,
          author: {
            name: authorName,
            // Default to basic verification level
            verificationLevel: "basic" as const
          },
          votes: position.votes || 0
        };
      }));
      
      console.log("Transformed positions data:", transformedData);
      return transformedData;
    },
    enabled: !!id
  });

  // Handle errors
  useEffect(() => {
    if (issueQuery.error) {
      toast.error("Failed to load issue details");
      console.error("Issue query error:", issueQuery.error);
    }
    
    if (positionsQuery.error) {
      toast.error("Failed to load positions");
      console.error("Positions query error:", positionsQuery.error);
    }
    
    setLoading(false);
  }, [issueQuery.error, positionsQuery.error]);

  // Show loading state
  if (loading && (issueQuery.isLoading || positionsQuery.isLoading)) {
    return (
      <Layout>
        <div className="container mx-auto max-w-4xl py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-slate-200 rounded w-1/2 mb-2"></div>
            <div className="h-24 bg-slate-200 rounded mb-4"></div>
          </div>
        </div>
      </Layout>
    );
  }

  // Show error state if both queries failed
  if (issueQuery.error && positionsQuery.error) {
    return (
      <Layout>
        <div className="container mx-auto max-w-4xl py-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Issue not found</h2>
          <p className="mb-4">The issue you're looking for doesn't exist or you don't have permission to view it.</p>
        </div>
      </Layout>
    );
  }

  // Fallback to mock data if the real data failed to load
  const issue = issueQuery.data || {
    id,
    title: "Issue not found",
    category: "Unknown",
    description: "This issue could not be loaded. It may have been deleted or you may not have permission to view it.",
    created_at: new Date().toISOString(),
    creatorName: "Unknown"
  };

  const positions = positionsQuery.data || [];
  
  console.log("Positions to be displayed:", positions, "Count:", positions.length);

  // Format the issue for IssueHeader component
  const formattedIssue = {
    id: issue.id,
    title: issue.title,
    category: issue.category,
    description: issue.description,
    createdAt: issue.created_at,
    votes: positions.reduce((sum, pos) => sum + pos.votes, 0),
    creator: {
      name: issue.creatorName || "Anonymous",
      verificationLevel: "basic" as const
    }
  };

  return (
    <Layout>
      <div className="container mx-auto max-w-4xl">
        <IssueHeader issue={formattedIssue} positionsCount={positions.length} />
        
        {positions.length === 0 ? (
          <div className="text-center py-6 bg-slate-50 rounded-lg mt-4 mb-6">
            <h3 className="text-lg font-medium mb-2">No positions yet</h3>
            <p className="text-muted-foreground">Be the first to add your position on this issue!</p>
          </div>
        ) : (
          <PositionsList 
            positions={positions}
            issueId={id || ""}
            isAuthenticated={isAuthenticated}
            userVotedPosition={userVotedPosition}
            positionVotes={positionVotes}
            onVote={handleVote}
          />
        )}
      </div>
    </Layout>
  );
};

export default IssueDetail;
