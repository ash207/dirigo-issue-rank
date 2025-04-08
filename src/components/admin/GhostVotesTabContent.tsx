
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

type GhostVote = {
  id: string;
  user_id: string;
  issue_id: string;
  position_id: string;
  created_at: string;
  user_email?: string;
  issue_title?: string;
  position_title?: string;
};

export function GhostVotesTabContent() {
  const [ghostVotes, setGhostVotes] = useState<GhostVote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { session } = useAuth();

  useEffect(() => {
    const fetchGhostVotes = async () => {
      if (!session?.access_token) {
        toast.error("Authentication required");
        return;
      }

      setIsLoading(true);
      try {
        // Fetch ghost votes from user_vote_tracking table
        const { data: voteData, error: voteError } = await supabase
          .from('user_vote_tracking')
          .select('*')
          .order('created_at', { ascending: false });

        if (voteError) throw voteError;

        // If we have ghost votes, get the related data
        if (voteData && voteData.length > 0) {
          const enrichedVotes = await enrichVotesWithDetails(voteData, session.access_token);
          setGhostVotes(enrichedVotes);
        } else {
          setGhostVotes([]);
        }
      } catch (error) {
        console.error("Error fetching ghost votes:", error);
        toast.error("Failed to fetch ghost votes");
      } finally {
        setIsLoading(false);
      }
    };

    fetchGhostVotes();
  }, [session]);

  // Enrich ghost votes with user emails, issue titles, and position titles
  const enrichVotesWithDetails = async (votes: GhostVote[], accessToken: string) => {
    try {
      // Get user emails for the vote user IDs
      const userIds = [...new Set(votes.map(vote => vote.user_id))];
      
      if (userIds.length > 0) {
        const { data: users } = await supabase.functions.invoke("get-user-emails", {
          headers: {
            Authorization: `Bearer ${accessToken}`
          },
          body: { userIds }
        });

        // Create a map of user IDs to emails
        const userMap = users ? users.reduce((acc, user) => {
          acc[user.id] = user.email;
          return acc;
        }, {} as Record<string, string>) : {};
        
        // Get issue titles
        const issueIds = [...new Set(votes.map(vote => vote.issue_id))];
        const { data: issues } = await supabase
          .from('issues')
          .select('id, title')
          .in('id', issueIds);
          
        const issueMap = issues ? issues.reduce((acc, issue) => {
          acc[issue.id] = issue.title;
          return acc;
        }, {} as Record<string, string>) : {};
        
        // Get position titles
        const positionIds = [...new Set(votes.map(vote => vote.position_id))];
        const { data: positions } = await supabase
          .from('positions')
          .select('id, title')
          .in('id', positionIds);
          
        const positionMap = positions ? positions.reduce((acc, position) => {
          acc[position.id] = position.title;
          return acc;
        }, {} as Record<string, string>) : {};
        
        // Combine all the data
        return votes.map(vote => ({
          ...vote,
          user_email: userMap[vote.user_id] || 'Unknown',
          issue_title: issueMap[vote.issue_id] || 'Unknown Issue',
          position_title: positionMap[vote.position_id] || 'Unknown Position'
        }));
      }
      
      return votes;
    } catch (error) {
      console.error("Error enriching ghost votes:", error);
      return votes;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Ghost Votes Overview</CardTitle>
          <CardDescription>
            View all ghost votes cast by users across the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-6 w-full" />
                </div>
              ))}
            </div>
          ) : ghostVotes.length === 0 ? (
            <div className="text-center p-6">
              <p className="text-muted-foreground">No ghost votes found</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Issue</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ghostVotes.map((vote) => (
                    <TableRow key={vote.id}>
                      <TableCell>
                        <div className="font-medium">{vote.user_email}</div>
                        <div className="text-xs text-muted-foreground">{vote.user_id}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{vote.issue_title}</div>
                        <div className="text-xs text-muted-foreground">{vote.issue_id}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{vote.position_title}</div>
                        <div className="text-xs text-muted-foreground">{vote.position_id}</div>
                      </TableCell>
                      <TableCell>
                        {new Date(vote.created_at).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
