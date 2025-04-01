
import { useState } from "react";
import { useParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import PositionCard from "@/components/positions/PositionCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

const IssueDetail = () => {
  const { id } = useParams();
  const [newPosition, setNewPosition] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

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
      verificationLevel: "voter"
    }
  };

  const positions = [
    {
      id: "1",
      content: "Yes, the minimum wage should be $15/hour nationwide. Workers need a living wage, and studies show minimal impact on overall employment with significant benefits to the economy through increased consumer spending.",
      author: { name: "SenatorSmith", verificationLevel: "official" },
      votes: 532
    },
    {
      id: "2",
      content: "I believe we need a minimum wage increase, but it should be phased in gradually and adjusted based on regional cost of living to minimize negative impacts on small businesses in lower-cost areas.",
      author: { name: "EconomistJones", verificationLevel: "voter" },
      votes: 421
    },
    {
      id: "3",
      content: "No, a nationwide $15 minimum wage would harm small businesses and lead to job cuts. We should focus on other ways to support low-wage workers like expanding the EITC and investing in education and job training.",
      author: { name: "BusinessOwner22", verificationLevel: "basic" },
      votes: 287
    },
  ];

  const handleSubmitPosition = () => {
    // In a real app, this would submit to the backend
    alert("Position submitted! (This would be saved to the database in the real app)");
    setNewPosition("");
    setDialogOpen(false);
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
                {issue.votes} people ranked this issue • {positions.length} positions
              </div>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-dirigo-blue">Add Your Position</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Share Your Position</DialogTitle>
                    <DialogDescription>
                      What's your stance on this issue? Be clear and concise.
                    </DialogDescription>
                  </DialogHeader>
                  <Textarea
                    placeholder="Write your position here..."
                    value={newPosition}
                    onChange={(e) => setNewPosition(e.target.value)}
                    className="min-h-[150px]"
                  />
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button 
                      className="bg-dirigo-blue" 
                      onClick={handleSubmitPosition}
                      disabled={!newPosition.trim()}
                    >
                      Submit Position
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Positions */}
        <Tabs defaultValue="top">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Positions</h2>
            <TabsList>
              <TabsTrigger value="top">Top Ranked</TabsTrigger>
              <TabsTrigger value="new">Newest</TabsTrigger>
              <TabsTrigger value="verified">Verified Only</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="top" className="space-y-4">
            {positions.sort((a, b) => b.votes - a.votes).map(position => (
              <PositionCard key={position.id} {...position} />
            ))}
          </TabsContent>

          <TabsContent value="new" className="space-y-4">
            {/* In real app, would be sorted by date */}
            {positions.map(position => (
              <PositionCard key={position.id} {...position} />
            ))}
          </TabsContent>

          <TabsContent value="verified" className="space-y-4">
            {positions
              .filter(p => p.author.verificationLevel === "voter" || p.author.verificationLevel === "official")
              .map(position => (
                <PositionCard key={position.id} {...position} />
              ))}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default IssueDetail;
