
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import PositionCard from "@/components/positions/PositionCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const IssueDetail = () => {
  const { id } = useParams();
  const [userVotedPosition, setUserVotedPosition] = useState<string | null>(null);
  const { isAuthenticated, user } = useAuth();
  
  // Mock data - would be fetched from backend
  const issue = {
    id,
    title: "Should the minimum wage be increased to $15/hour nationwide?",
    category: "Federal",
    description: "The federal minimum wage has been $7.25 per hour since 2009. Many argue it should be raised to $15 to provide a living wage, while others contend such an increase would lead to job losses and business closures. What's your position?",
    createdAt: "2023-06-12T15:30:00Z",
    votes: 1240,
    creator: {
      name: "JaneDoe",
      verificationLevel: "voter" as const
    }
  };

  const positions = [
    {
      id: "1",
      title: "Support for $15 Minimum Wage",
      content: "Yes, the minimum wage should be $15/hour nationwide. Workers need a living wage, and studies show minimal impact on overall employment with significant benefits to the economy through increased consumer spending.",
      author: { 
        name: "SenatorSmith", 
        verificationLevel: "official" as const
      },
      votes: 532,
    },
    {
      id: "2",
      title: "Gradual Phased Implementation",
      content: "I believe we need a minimum wage increase, but it should be phased in gradually and adjusted based on regional cost of living to minimize negative impacts on small businesses in lower-cost areas.",
      author: { 
        name: "EconomistJones", 
        verificationLevel: "voter" as const
      },
      votes: 421,
    },
    {
      id: "3",
      title: "Opposition to Nationwide Increase",
      content: "No, a nationwide $15 minimum wage would harm small businesses and lead to job cuts. We should focus on other ways to support low-wage workers like expanding the EITC and investing in education and job training.",
      author: { 
        name: "BusinessOwner22", 
        verificationLevel: "basic" as const
      },
      votes: 287,
    },
  ];

  // Check for existing user vote when user is authenticated
  useEffect(() => {
    const fetchUserVote = async () => {
      if (!isAuthenticated || !user || !id) return;
      
      try {
        const { data, error } = await supabase
          .from('user_votes')
          .select('position_id')
          .eq('user_id', user.id)
          .eq('issue_id', id)
          .single();
        
        if (error && error.code !== 'PGRST116') { // PGRST116 means no rows returned
          console.error("Error fetching vote:", error);
          return;
        }
        
        if (data) {
          setUserVotedPosition(data.position_id);
        }
      } catch (error) {
        console.error("Error in fetchUserVote:", error);
      }
    };
    
    fetchUserVote();
  }, [isAuthenticated, user, id]);

  // Handle position voting
  const handleVote = async (positionId: string) => {
    if (!isAuthenticated || !user || !id) return;
    
    try {
      if (userVotedPosition) {
        if (userVotedPosition === positionId) {
          // User is trying to unvote - not allowed in this implementation
          toast.info("You can't remove your vote once cast");
          return;
        } else {
          // User is changing their vote
          // First, remove the old vote
          await supabase
            .from('user_votes')
            .delete()
            .eq('user_id', user.id)
            .eq('issue_id', id);
          
          // Then add the new vote
          const { error } = await supabase
            .from('user_votes')
            .insert({
              user_id: user.id,
              issue_id: id,
              position_id: positionId,
            });
          
          if (error) throw error;
          
          setUserVotedPosition(positionId);
          toast.success("Your vote has been updated!");
        }
      } else {
        // User is voting for the first time
        const { error } = await supabase
          .from('user_votes')
          .insert({
            user_id: user.id,
            issue_id: id,
            position_id: positionId,
          });
        
        if (error) throw error;
        
        setUserVotedPosition(positionId);
        toast.success("Your vote has been recorded!");
      }
    } catch (error: any) {
      console.error("Error saving vote:", error);
      toast.error("Failed to save your vote. Please try again.");
    }
  };

  return (
    <Layout>
      <div className="container mx-auto max-w-4xl">
        {/* Issue details */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between items-start mb-2">
              <Badge className="bg-dirigo-blue">{issue.category}</Badge>
              <span className="text-sm text-muted-foreground">
                Posted by <span className="text-verification-voter">@{issue.creator.name}</span>
              </span>
            </div>
            <CardTitle className="text-2xl">{issue.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-6">{issue.description}</p>
            
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                {issue.votes} people viewed this issue • {positions.length} positions
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Positions */}
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Positions</h2>
          {!isAuthenticated && (
            <Button 
              variant="outline"
              onClick={() => window.location.href = "/sign-in"}
            >
              Sign in to vote
            </Button>
          )}
        </div>
        
        <Tabs defaultValue="top">
          <TabsList>
            <TabsTrigger value="top">Top</TabsTrigger>
            <TabsTrigger value="new">Newest</TabsTrigger>
            <TabsTrigger value="verified">Verified Only</TabsTrigger>
          </TabsList>

          <TabsContent value="top" className="space-y-4">
            {positions.sort((a, b) => b.votes - a.votes).map(position => (
              <PositionCard 
                key={position.id}
                {...position}
                userVotedPosition={userVotedPosition}
                onVote={handleVote}
                isAuthenticated={isAuthenticated}
              />
            ))}
          </TabsContent>

          <TabsContent value="new" className="space-y-4">
            {/* In real app, would be sorted by date */}
            {positions.map(position => (
              <PositionCard 
                key={position.id}
                {...position}
                userVotedPosition={userVotedPosition}
                onVote={handleVote}
                isAuthenticated={isAuthenticated}
              />
            ))}
          </TabsContent>

          <TabsContent value="verified" className="space-y-4">
            {positions
              .filter(p => p.author.verificationLevel === "voter" || p.author.verificationLevel === "official")
              .map(position => (
                <PositionCard 
                  key={position.id} 
                  {...position}
                  userVotedPosition={userVotedPosition}
                  onVote={handleVote}
                  isAuthenticated={isAuthenticated}
                />
              ))}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default IssueDetail;
