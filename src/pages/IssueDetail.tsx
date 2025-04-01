
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
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";

const IssueDetail = () => {
  const { id } = useParams();
  const [rankingMode, setRankingMode] = useState(false);
  const [rankedPositions, setRankedPositions] = useState<Array<any>>([]);
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

  // Check for existing user rankings when user is authenticated
  useEffect(() => {
    const fetchUserRankings = async () => {
      if (!isAuthenticated || !user || !id) return;
      
      try {
        const { data, error } = await supabase
          .from('user_rankings')
          .select('rankings')
          .eq('user_id', user.id)
          .eq('issue_id', id)
          .single();
        
        if (error) {
          console.error("Error fetching rankings:", error);
          return;
        }
        
        if (data && data.rankings) {
          // If user has existing rankings, load them
          const positionsWithRankings = [];
          // Convert stored position IDs back to full position objects
          for (const posId of data.rankings) {
            const position = positions.find(p => p.id === posId);
            if (position) {
              positionsWithRankings.push(position);
            }
          }
          setRankedPositions(positionsWithRankings);
        }
      } catch (error) {
        console.error("Error in fetchUserRankings:", error);
      }
    };
    
    fetchUserRankings();
  }, [isAuthenticated, user, id]);

  // Function to handle position drag and drop for ranking
  const handleDragStart = (e: React.DragEvent, position: any) => {
    e.dataTransfer.setData("positionId", position.id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    const positionId = e.dataTransfer.getData("positionId");
    const currentPositions = [...rankedPositions];
    
    // Remove the position from its current place
    const position = currentPositions.find(p => p.id === positionId);
    if (!position) return;
    
    const filteredPositions = currentPositions.filter(p => p.id !== positionId);
    
    // Insert at the target index
    filteredPositions.splice(targetIndex, 0, position);
    setRankedPositions(filteredPositions);
  };

  const toggleRankingMode = () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to rank positions", {
        description: "You need to be logged in to rank positions.",
        action: {
          label: "Sign In",
          onClick: () => window.location.href = "/sign-in"
        }
      });
      return;
    }
    
    if (!rankingMode) {
      // Initialize ranking mode with the current positions
      setRankedPositions(positions);
    }
    setRankingMode(!rankingMode);
  };

  const submitRankings = async () => {
    if (!isAuthenticated || !user) {
      toast.error("Please sign in to submit rankings");
      return;
    }
    
    try {
      const positionIds = rankedPositions.map(p => p.id);
      
      const { error } = await supabase.from('user_rankings').upsert({
        user_id: user.id,
        issue_id: id,
        rankings: positionIds,
        updated_at: new Date().toISOString()
      });
      
      if (error) throw error;
      
      toast.success("Your position rankings have been submitted!");
      setRankingMode(false);
    } catch (error: any) {
      console.error("Error submitting rankings:", error);
      toast.error("Failed to submit your rankings. Please try again.");
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
          <Button 
            variant={rankingMode ? "destructive" : "outline"}
            onClick={toggleRankingMode}
          >
            {rankingMode ? "Cancel Ranking" : "Rank Positions"}
          </Button>
        </div>
        
        {rankingMode ? (
          <div className="mb-6">
            <p className="mb-4 text-sm text-muted-foreground">
              Drag and drop positions to rank them in your order of preference. #1 is your most preferred position.
            </p>
            {rankedPositions.map((position, index) => (
              <div 
                key={position.id} 
                draggable
                onDragStart={(e) => handleDragStart(e, position)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                className="relative"
              >
                <div className="absolute -left-8 top-1/2 transform -translate-y-1/2 bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center z-10">
                  {index + 1}
                </div>
                <PositionCard {...position} interactive={false} />
              </div>
            ))}
            <div className="mt-4 flex justify-end">
              <Button onClick={submitRankings} className="bg-dirigo-blue">
                Submit Rankings
              </Button>
            </div>
          </div>
        ) : (
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
                />
              ))}
            </TabsContent>

            <TabsContent value="new" className="space-y-4">
              {/* In real app, would be sorted by date */}
              {positions.map(position => (
                <PositionCard 
                  key={position.id}
                  {...position} 
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
                  />
                ))}
            </TabsContent>
          </Tabs>
        )}

        {/* We would add a ranking results visualization here */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg">Ranking Results</CardTitle>
          </CardHeader>
          <CardContent>
            {!isAuthenticated ? (
              <p className="text-sm text-muted-foreground">
                <Button variant="link" className="p-0 h-auto" onClick={() => window.location.href = "/sign-in"}>
                  Sign in
                </Button> to see and submit rankings.
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                {rankingMode ? "Submit your rankings to see how your preferences compare with others." : 
                "Click 'Rank Positions' to submit your preferences and see how they compare with others."}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default IssueDetail;
