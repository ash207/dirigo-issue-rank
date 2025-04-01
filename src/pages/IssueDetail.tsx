
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
  const [rankedPositions, setRankedPositions] = useState<Map<string, number>>(new Map());
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
          // Create a new Map to store position IDs and their ranks
          const rankingsMap = new Map<string, number>();
          
          // Ensure rankings is treated as an array of position IDs
          if (Array.isArray(data.rankings)) {
            // If it's an array, the index + 1 is the rank
            data.rankings.forEach((posId, index) => {
              if (typeof posId === 'string') {
                rankingsMap.set(posId, index + 1);
              }
            });
          } else if (typeof data.rankings === 'object') {
            // If it's an object, convert values to an array
            Object.entries(data.rankings).forEach(([key, value]) => {
              if (typeof value === 'string') {
                // Try to parse the key as a number (rank) and the value as the position ID
                const rank = parseInt(key);
                if (!isNaN(rank)) {
                  rankingsMap.set(value, rank);
                }
              }
            });
          }

          setRankedPositions(rankingsMap);
        }
      } catch (error) {
        console.error("Error in fetchUserRankings:", error);
      }
    };
    
    fetchUserRankings();
  }, [isAuthenticated, user, id]);

  // Handle position ranking change
  const handleRankChange = (positionId: string, newRank: number) => {
    // Create a copy of the current rankings map
    const updatedRankings = new Map(rankedPositions);
    
    // If another position already has this rank, we need to swap or shift
    let positionToSwap = "";
    for (const [id, rank] of updatedRankings.entries()) {
      if (rank === newRank) {
        positionToSwap = id;
        break;
      }
    }
    
    // If this position already has a rank and we're changing it
    const currentRank = updatedRankings.get(positionId);
    
    if (positionToSwap) {
      // If we're swapping with another position
      if (currentRank !== undefined) {
        // Simple swap - the other position gets this one's old rank
        updatedRankings.set(positionToSwap, currentRank);
      } else {
        // The other position needs to be pushed down
        // Find all positions with rank >= newRank and increment their rank
        for (const [id, rank] of updatedRankings.entries()) {
          if (rank >= newRank && id !== positionId) {
            updatedRankings.set(id, rank + 1);
          }
        }
      }
    }
    
    // Set the new rank for this position
    updatedRankings.set(positionId, newRank);
    
    // Update state with new rankings
    setRankedPositions(updatedRankings);
    
    // Save rankings to database
    saveRankings(updatedRankings);
  };

  // Save rankings to Supabase
  const saveRankings = async (rankings: Map<string, number>) => {
    if (!isAuthenticated || !user || !id) return;
    
    try {
      // Convert Map to array sorted by rank
      const sortedArray = Array.from(rankings.entries())
        .sort((a, b) => a[1] - b[1])
        .map(([id]) => id); // Extract just the position IDs in order of rank
      
      const { error } = await supabase.from('user_rankings').upsert({
        user_id: user.id,
        issue_id: id,
        rankings: sortedArray,
        updated_at: new Date().toISOString()
      });
      
      if (error) throw error;
      
      toast.success("Your position ranking has been saved!");
    } catch (error: any) {
      console.error("Error saving rankings:", error);
      toast.error("Failed to save your ranking. Please try again.");
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
          {isAuthenticated ? (
            <div className="text-sm text-muted-foreground">
              Click the arrow icon to rank positions
            </div>
          ) : (
            <Button 
              variant="outline"
              onClick={() => window.location.href = "/sign-in"}
            >
              Sign in to rank
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
                rank={rankedPositions.get(position.id) || null}
                onRankChange={handleRankChange}
                totalPositions={positions.length}
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
                rank={rankedPositions.get(position.id) || null}
                onRankChange={handleRankChange}
                totalPositions={positions.length}
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
                  rank={rankedPositions.get(position.id) || null}
                  onRankChange={handleRankChange}
                  totalPositions={positions.length}
                  isAuthenticated={isAuthenticated}
                />
              ))}
          </TabsContent>
        </Tabs>

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
                {rankedPositions.size > 0 
                  ? `You've ranked ${rankedPositions.size} of ${positions.length} positions.` 
                  : "Click the arrow icon on positions to rank them."}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default IssueDetail;
