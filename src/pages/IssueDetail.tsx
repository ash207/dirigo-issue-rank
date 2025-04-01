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
import { toast } from "sonner";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  KeyboardSensor,
  closestCenter
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove
} from '@dnd-kit/sortable';

const IssueDetail = () => {
  const { id } = useParams();
  const [newPosition, setNewPosition] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [userRanks, setUserRanks] = useState<Record<string, number>>({ "1": 1 });
  
  // Calculate used ranks from the userRanks object
  const usedRanks = Object.values(userRanks);

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

  const [positions, setPositions] = useState([
    {
      id: "1",
      content: "Yes, the minimum wage should be $15/hour nationwide. Workers need a living wage, and studies show minimal impact on overall employment with significant benefits to the economy through increased consumer spending.",
      author: { 
        name: "SenatorSmith", 
        verificationLevel: "official" as const
      },
      votes: 532,
      userRank: userRanks["1"] || null
    },
    {
      id: "2",
      content: "I believe we need a minimum wage increase, but it should be phased in gradually and adjusted based on regional cost of living to minimize negative impacts on small businesses in lower-cost areas.",
      author: { 
        name: "EconomistJones", 
        verificationLevel: "voter" as const
      },
      votes: 421,
      userRank: userRanks["2"] || null
    },
    {
      id: "3",
      content: "No, a nationwide $15 minimum wage would harm small businesses and lead to job cuts. We should focus on other ways to support low-wage workers like expanding the EITC and investing in education and job training.",
      author: { 
        name: "BusinessOwner22", 
        verificationLevel: "basic" as const
      },
      votes: 287,
      userRank: userRanks["3"] || null
    },
  ]);

  // Set up DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 5px movement before drag starts
      },
    }),
    useSensor(KeyboardSensor)
  );

  // Handle drag end event
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      // Find the positions
      setPositions((items) => {
        // Find the indices of the dragged and target items
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        
        // Rearrange the positions array
        const reorderedPositions = arrayMove(items, oldIndex, newIndex);
        
        // Auto-assign ranks to the first 5 positions if they don't already have ranks
        const newRanks = { ...userRanks };
        for (let i = 0; i < Math.min(reorderedPositions.length, 5); i++) {
          const position = reorderedPositions[i];
          newRanks[position.id] = i + 1;
        }
        
        // Update the userRanks state
        setUserRanks(newRanks);
        
        // Show toast notification
        toast.success("Position ranks updated successfully!");
        
        // Update positions with new ranks
        return reorderedPositions.map(position => ({
          ...position,
          userRank: newRanks[position.id] || null,
          userVoted: newRanks[position.id] ? "up" : null // Auto-upvote ranked positions
        }));
      });
    }
  };

  // Handle rank changes from PositionCard components
  const handleRankChange = (positionId: string, rank: number | null) => {
    setUserRanks(prevRanks => {
      const newRanks = { ...prevRanks };
      
      if (rank === null) {
        // If removing rank, delete the entry
        delete newRanks[positionId];
        return newRanks;
      }
      
      // Find if this rank is already assigned to another position
      const positionWithSameRank = Object.entries(newRanks).find(
        ([id, existingRank]) => existingRank === rank && id !== positionId
      );
      
      // If this rank is being used somewhere else
      if (positionWithSameRank) {
        const [conflictingId, conflictingRank] = positionWithSameRank;
        
        // Get the previous rank of the current position (if any)
        const prevRank = newRanks[positionId];
        
        // Swap the ranks - move the conflicting position to the previous rank of current position
        if (prevRank) {
          newRanks[conflictingId] = prevRank;
        } else {
          // If current position wasn't ranked before, just remove rank from conflicting position
          delete newRanks[conflictingId];
        }
      }
      
      // Set the new rank for current position
      newRanks[positionId] = rank;
      
      // Show toast notification about the rank change
      if (positionWithSameRank) {
        const [conflictingId] = positionWithSameRank;
        const conflictingPosition = positions.find(p => p.id === conflictingId);
        if (conflictingPosition) {
          toast.info(`Rank order updated: "${conflictingPosition.author.name}'s position" was reordered`);
        }
      }
      
      return newRanks;
    });

    // Also update the positions array with the new rank
    setPositions(positions.map(position => {
      if (position.id === positionId) {
        return { ...position, userRank: rank };
      } 
      return position;
    }));
  };

  const handleSubmitPosition = () => {
    toast.success("Position submitted successfully!");
    setNewPosition("");
    setDialogOpen(false);
  };

  // Get the sorted positions for the active tab
  const getSortedPositions = (tabValue: string) => {
    let filteredPositions = [...positions];
    
    if (tabValue === "verified") {
      filteredPositions = filteredPositions.filter(
        p => p.author.verificationLevel === "voter" || p.author.verificationLevel === "official"
      );
    }
    
    // For the top tab, sort by votes
    if (tabValue === "top") {
      filteredPositions.sort((a, b) => b.votes - a.votes);
    }
    
    // Update ranks in the position objects
    return filteredPositions.map(position => ({
      ...position,
      userRank: userRanks[position.id] || null
    }));
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

          <DndContext 
            sensors={sensors} 
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <TabsContent value="top">
              <SortableContext 
                items={getSortedPositions("top").map(p => p.id)}
                strategy={verticalListSortingStrategy}
              >
                {getSortedPositions("top").map(position => (
                  <PositionCard 
                    key={position.id}
                    {...position}
                    usedRanks={usedRanks}
                    onRankChange={handleRankChange}
                    isDraggable={true}
                  />
                ))}
              </SortableContext>
            </TabsContent>

            <TabsContent value="new">
              <SortableContext 
                items={getSortedPositions("new").map(p => p.id)}
                strategy={verticalListSortingStrategy}
              >
                {getSortedPositions("new").map(position => (
                  <PositionCard 
                    key={position.id}
                    {...position} 
                    usedRanks={usedRanks}
                    onRankChange={handleRankChange}
                    isDraggable={true}
                  />
                ))}
              </SortableContext>
            </TabsContent>

            <TabsContent value="verified">
              <SortableContext 
                items={getSortedPositions("verified").map(p => p.id)}
                strategy={verticalListSortingStrategy}
              >
                {getSortedPositions("verified").map(position => (
                  <PositionCard 
                    key={position.id} 
                    {...position}
                    usedRanks={usedRanks}
                    onRankChange={handleRankChange}
                    isDraggable={true}
                  />
                ))}
              </SortableContext>
            </TabsContent>
          </DndContext>
        </Tabs>
      </div>
    </Layout>
  );
};

export default IssueDetail;
