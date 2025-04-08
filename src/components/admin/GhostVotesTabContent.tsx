
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

type GhostVote = {
  id: string;
  position_id: string;
  issue_id: string;
  created_at: string;
  issue_title?: string;
  position_title?: string;
  count: number;
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
        // Fetch ghost votes from anonymous_vote_counts table
        const { data: voteData, error: voteError } = await supabase
          .from('anonymous_vote_counts')
          .select('*')
          .order('last_updated', { ascending: false });

        if (voteError) throw voteError;

        // If we have ghost votes, get the related data
        if (voteData && voteData.length > 0) {
          const enrichedVotes = await enrichVotesWithDetails(voteData);
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

  // Enrich ghost votes with issue titles and position titles
  const enrichVotesWithDetails = async (votes: GhostVote[]) => {
    try {
      // Get issue titles and position titles
      const positionIds = [...new Set(votes.map(vote => vote.position_id))];
      
      if (positionIds.length > 0) {
        const { data: positions } = await supabase
          .from('positions')
          .select('id, title, issue_id, issues(title)')
          .in('id', positionIds);
          
        const positionMap = positions ? positions.reduce((acc, position) => {
          acc[position.id] = {
            title: position.title,
            issueId: position.issue_id,
            issueTitle: position.issues?.title || 'Unknown Issue'
          };
          return acc;
        }, {} as Record<string, { title: string, issueId: string, issueTitle: string }>) : {};
        
        // Combine all the data
        return votes.map(vote => ({
          ...vote,
          issue_id: positionMap[vote.position_id]?.issueId || vote.issue_id || 'Unknown',
          issue_title: positionMap[vote.position_id]?.issueTitle || 'Unknown Issue',
          position_title: positionMap[vote.position_id]?.title || 'Unknown Position'
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
            View anonymous ghost votes cast across the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-6">
            <InfoIcon className="h-4 w-4" />
            <AlertTitle>Anonymous Voting Information</AlertTitle>
            <AlertDescription>
              Ghost votes are truly anonymous - we don't track which users cast them. This table shows 
              only the positions that received ghost votes, the count, and when they were last updated.
            </AlertDescription>
          </Alert>

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
                    <TableHead>Issue</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Vote Count</TableHead>
                    <TableHead>Last Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ghostVotes.map((vote) => (
                    <TableRow key={vote.id}>
                      <TableCell>
                        <div className="font-medium">{vote.issue_title}</div>
                        <div className="text-xs text-muted-foreground">{vote.issue_id}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{vote.position_title}</div>
                        <div className="text-xs text-muted-foreground">{vote.position_id}</div>
                      </TableCell>
                      <TableCell>
                        {vote.count}
                      </TableCell>
                      <TableCell>
                        {new Date(vote.last_updated || vote.created_at).toLocaleString()}
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
