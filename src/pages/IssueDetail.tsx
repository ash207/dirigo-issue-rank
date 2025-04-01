
import { useParams } from "react-router-dom";
import { useState } from "react";
import Layout from "@/components/layout/Layout";
import PositionCard from "@/components/positions/PositionCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const IssueDetail = () => {
  const { id } = useParams();
  const [mode, setMode] = useState<"view" | "rank">("view");
  const [rankedPositions, setRankedPositions] = useState<any[]>([]);
  const [draggedPosition, setDraggedPosition] = useState<string | null>(null);
  const [hasSubmittedRankings, setHasSubmittedRankings] = useState(false);
  const [rankingResults, setRankingResults] = useState<any[]>([]);
  
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

  // Initialize ranking positions if not already set
  if (rankedPositions.length === 0 && mode === "rank") {
    setRankedPositions([...positions].map((pos, index) => ({ ...pos, ranking: index + 1 })));
  }

  // Mock data for ranking results
  const mockRankingResults = [
    { name: "Round 1", "Support for $15": 45, "Gradual Phase-in": 35, "Opposition": 20 },
    { name: "Round 2", "Support for $15": 55, "Gradual Phase-in": 45, "Opposition": 0 },
    { name: "Final", "Support for $15": 60, "Gradual Phase-in": 40, "Opposition": 0 },
  ];

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    const positionId = e.currentTarget.dataset.positionId;
    if (positionId) {
      setDraggedPosition(positionId);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const targetId = e.currentTarget.dataset.positionId;
    
    if (draggedPosition && targetId && draggedPosition !== targetId) {
      const updatedPositions = [...rankedPositions];
      
      const draggedIndex = updatedPositions.findIndex(p => p.id === draggedPosition);
      const targetIndex = updatedPositions.findIndex(p => p.id === targetId);
      
      const draggedItem = updatedPositions[draggedIndex];
      
      // Remove the dragged item
      updatedPositions.splice(draggedIndex, 1);
      // Insert it at the target position
      updatedPositions.splice(targetIndex, 0, draggedItem);
      
      // Update rankings
      const rerankedPositions = updatedPositions.map((pos, idx) => ({
        ...pos,
        ranking: idx + 1
      }));
      
      setRankedPositions(rerankedPositions);
    }
    
    setDraggedPosition(null);
  };

  const handleSubmitRankings = () => {
    // In a real app, this would send the rankings to the backend
    console.log("Submitting rankings:", rankedPositions.map(p => ({ id: p.id, rank: p.ranking })));
    setHasSubmittedRankings(true);
    setRankingResults(mockRankingResults);
    // Switch back to view mode
    setMode("view");
  };

  const handleStartRanking = () => {
    setMode("rank");
  };

  const handleCancelRanking = () => {
    setMode("view");
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
        {mode === "view" ? (
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Positions</h2>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  onClick={handleStartRanking}
                  className="flex items-center gap-2"
                >
                  Rank Positions
                </Button>
              </div>
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
            
            {/* Show ranking results if user has submitted rankings */}
            {hasSubmittedRankings && (
              <div className="mt-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">Ranked-Choice Results</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <p className="text-sm text-muted-foreground mb-4">
                        These results show how public opinion shifted through rounds of ranked-choice voting, 
                        eliminating the least popular option in each round.
                      </p>
                      
                      <div className="h-80">
                        <ChartContainer 
                          config={{
                            "Support for $15": {
                              theme: { light: "#2563eb", dark: "#3b82f6" }
                            },
                            "Gradual Phase-in": {
                              theme: { light: "#16a34a", dark: "#22c55e" }
                            },
                            "Opposition": {
                              theme: { light: "#dc2626", dark: "#ef4444" }
                            },
                          }}
                        >
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart 
                              data={rankingResults}
                              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                              <XAxis dataKey="name" />
                              <YAxis label={{ value: 'Votes (%)', angle: -90, position: 'insideLeft' }} />
                              <Tooltip />
                              <Bar dataKey="Support for $15" stackId="a" fill="var(--color-Support for $15)" />
                              <Bar dataKey="Gradual Phase-in" stackId="a" fill="var(--color-Gradual Phase-in)" />
                              <Bar dataKey="Opposition" stackId="a" fill="var(--color-Opposition)" />
                            </BarChart>
                          </ResponsiveContainer>
                        </ChartContainer>
                      </div>
                      
                      <ChartLegend>
                        <ChartLegendContent 
                          payload={[
                            { value: "Support for $15", dataKey: "Support for $15", color: "#2563eb" },
                            { value: "Gradual Phase-in", dataKey: "Gradual Phase-in", color: "#16a34a" },
                            { value: "Opposition", dataKey: "Opposition", color: "#dc2626" }
                          ]} 
                        />
                      </ChartLegend>
                      
                      <Table className="mt-6">
                        <TableHeader>
                          <TableRow>
                            <TableHead>Round</TableHead>
                            <TableHead>Position</TableHead>
                            <TableHead className="text-right">Votes (%)</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell rowSpan={3}>Round 1</TableCell>
                            <TableCell>Support for $15</TableCell>
                            <TableCell className="text-right">45%</TableCell>
                            <TableCell>Advanced</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Gradual Phase-in</TableCell>
                            <TableCell className="text-right">35%</TableCell>
                            <TableCell>Advanced</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Opposition</TableCell>
                            <TableCell className="text-right">20%</TableCell>
                            <TableCell className="text-red-500">Eliminated</TableCell>
                          </TableRow>
                          
                          <TableRow>
                            <TableCell rowSpan={2}>Round 2</TableCell>
                            <TableCell>Support for $15</TableCell>
                            <TableCell className="text-right">55%</TableCell>
                            <TableCell className="font-bold text-emerald-600">Winner</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Gradual Phase-in</TableCell>
                            <TableCell className="text-right">45%</TableCell>
                            <TableCell>Runner-up</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        ) : (
          // Ranking mode
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Rank These Positions</h2>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={handleCancelRanking}>Cancel</Button>
                <Button onClick={handleSubmitRankings}>Submit Rankings</Button>
              </div>
            </div>
            
            <Card className="p-4 mb-4">
              <p className="text-sm">
                Drag and drop the positions below to rank them in your order of preference. 
                Position #1 is your most preferred option.
              </p>
            </Card>
            
            <div className="space-y-4">
              {rankedPositions.map(position => (
                <PositionCard
                  key={position.id}
                  {...position}
                  isDraggable={true}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                />
              ))}
            </div>
            
            <div className="mt-4 text-center">
              <Button onClick={handleSubmitRankings} size="lg">Submit My Rankings</Button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default IssueDetail;
