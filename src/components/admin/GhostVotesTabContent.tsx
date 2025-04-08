
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
import { InfoIcon, UserIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type GhostVote = {
  id: string;
  position_id: string;
  issue_id: string;
  created_at: string;
  issue_title?: string;
  position_title?: string;
  count: number;
  last_updated: string;
  user_id?: string | null;
  user_name?: string;
  user_email?: string;
  is_anonymous: boolean;
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
        // Fetch anonymous vote counts first
        const { data: anonymousVotes, error: anonymousError } = await supabase
          .from('anonymous_vote_counts')
          .select('*')
          .order('last_updated', { ascending: false });
          
        if (anonymousError) throw anonymousError;
        
        let allGhostVotes: GhostVote[] = [];
        
        // Process anonymous votes
        if (anonymousVotes && anonymousVotes.length > 0) {
          const enrichedVotes = await enrichVotesWithDetails(anonymousVotes);
          allGhostVotes = enrichedVotes.map(vote => ({
            ...vote,
            is_anonymous: true
          }));
        }
        
        // Then fetch legacy ghost votes from user_vote_tracking table
        const { data: voteData, error: voteError } = await supabase
          .from('user_vote_tracking')
          .select(`
            id,
            position_id,
            issue_id,
            created_at,
            user_id
          `)
          .order('created_at', { ascending: false });

        if (voteError) throw voteError;

        if (voteData && voteData.length > 0) {
          // Fetch user profiles for the vote data
          const userIds = voteData.map(vote => vote.user_id).filter(Boolean);
          
          let userProfiles: Record<string, { name: string; email: string }> = {};
          
          if (userIds.length > 0) {
            const { data: profiles } = await supabase
              .from('profiles')
              .select('id, name')
              .in('id', userIds);
              
            // Get user emails from Auth service via admin function
            const { data: userEmails, error: userEmailsError } = await supabase.functions.invoke("get-user-emails", {
              headers: {
                Authorization: `Bearer ${session.access_token}`
              },
              body: {
                userIds
              }
            });
            
            if (userEmailsError) {
              console.error("Error fetching user emails:", userEmailsError);
            } else if (userEmails) {
              // Create a mapping of user IDs to their profile information
              profiles?.forEach(profile => {
                const email = userEmails.find((u: any) => u.id === profile.id)?.email || 'Unknown';
                userProfiles[profile.id] = {
                  name: profile.name || 'Unnamed User',
                  email
                };
              });
            }
          }
          
          // Fetch position details separately
          const positionIds = [...new Set(voteData.map(vote => vote.position_id))];
          const { data: positions } = await supabase
            .from('positions')
            .select('id, title, issue_id, issues:issue_id(title)')
            .in('id', positionIds);
            
          const positionMap = positions ? positions.reduce((acc, position) => {
            acc[position.id] = {
              title: position.title,
              issueId: position.issue_id,
              issueTitle: position.issues ? (position.issues as any).title : 'Unknown Issue'
            };
            return acc;
          }, {} as Record<string, { title: string, issueId: string, issueTitle: string }>) : {};
          
          // Transform the vote data to include user and position information
          const transformedVotes: GhostVote[] = voteData.map(vote => ({
            id: vote.id,
            position_id: vote.position_id,
            issue_id: vote.issue_id,
            created_at: vote.created_at,
            last_updated: vote.created_at,
            count: 1, // Individual ghost votes always have count of 1
            issue_title: positionMap[vote.position_id]?.issueTitle || 'Unknown Issue',
            position_title: positionMap[vote.position_id]?.title || 'Unknown Position',
            user_id: vote.user_id,
            user_name: vote.user_id ? userProfiles[vote.user_id]?.name : 'Legacy Ghost Vote',
            user_email: vote.user_id ? userProfiles[vote.user_id]?.email : 'legacy-ghost@example.com',
            is_anonymous: false
          }));
          
          // Combine both types of ghost votes
          allGhostVotes = [...allGhostVotes, ...transformedVotes];
        }
        
        // Sort by last updated/created date
        allGhostVotes.sort((a, b) => {
          const dateA = new Date(a.last_updated || a.created_at);
          const dateB = new Date(b.last_updated || b.created_at);
          return dateB.getTime() - dateA.getTime();
        });
        
        setGhostVotes(allGhostVotes);
      } catch (error) {
        console.error("Error fetching ghost votes:", error);
        toast.error("Failed to fetch ghost votes");
      } finally {
        setIsLoading(false);
      }
    };

    fetchGhostVotes();
  }, [session]);

  // Enrich anonymous ghost votes with issue titles and position titles
  const enrichVotesWithDetails = async (votes: any[]) => {
    try {
      // Get issue titles and position titles
      const positionIds = [...new Set(votes.map(vote => vote.position_id))];
      
      if (positionIds.length > 0) {
        const { data: positions } = await supabase
          .from('positions')
          .select('id, title, issue_id, issues:issue_id(title)')
          .in('id', positionIds);
          
        const positionMap = positions ? positions.reduce((acc, position) => {
          acc[position.id] = {
            title: position.title,
            issueId: position.issue_id,
            issueTitle: position.issues ? (position.issues as any).title : 'Unknown Issue'
          };
          return acc;
        }, {} as Record<string, { title: string, issueId: string, issueTitle: string }>) : {};
        
        // Combine all the data
        return votes.map(vote => ({
          ...vote,
          issue_id: positionMap[vote.position_id]?.issueId || vote.issue_id || 'Unknown',
          issue_title: positionMap[vote.position_id]?.issueTitle || 'Unknown Issue',
          position_title: positionMap[vote.position_id]?.title || 'Unknown Position',
          user_id: null,
          user_name: 'Anonymous User',
          user_email: 'anonymous@example.com'
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
            View ghost votes cast across the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-6">
            <InfoIcon className="h-4 w-4" />
            <AlertTitle>Ghost Voting Information</AlertTitle>
            <AlertDescription>
              This table shows both truly anonymous ghost votes (aggregated by position) and legacy tracked ghost votes 
              (associated with specific users but shown for historical purposes only). 
              New ghost votes are now completely anonymous with no user tracking.
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
                    <TableHead>User</TableHead>
                    <TableHead>Issue</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Vote Count</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ghostVotes.map((vote) => (
                    <TableRow key={vote.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              <UserIcon className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{vote.user_name || 'Anonymous'}</div>
                            <div className="text-xs text-muted-foreground">{vote.user_email || 'anonymous@example.com'}</div>
                          </div>
                        </div>
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
                        {vote.count}
                      </TableCell>
                      <TableCell>
                        {new Date(vote.last_updated || vote.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          vote.is_anonymous 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {vote.is_anonymous ? 'Truly Anonymous' : 'Legacy Tracked'}
                        </span>
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
