
import { useParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import PositionCard from "@/components/positions/PositionCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

const IssueDetail = () => {
  const { id } = useParams();
  
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
      content: "Yes, the minimum wage should be $15/hour nationwide. Workers need a living wage, and studies show minimal impact on overall employment with significant benefits to the economy through increased consumer spending.",
      author: { 
        name: "SenatorSmith", 
        verificationLevel: "official" as const
      },
      votes: 532,
    },
    {
      id: "2",
      content: "I believe we need a minimum wage increase, but it should be phased in gradually and adjusted based on regional cost of living to minimize negative impacts on small businesses in lower-cost areas.",
      author: { 
        name: "EconomistJones", 
        verificationLevel: "voter" as const
      },
      votes: 421,
    },
    {
      id: "3",
      content: "No, a nationwide $15 minimum wage would harm small businesses and lead to job cuts. We should focus on other ways to support low-wage workers like expanding the EITC and investing in education and job training.",
      author: { 
        name: "BusinessOwner22", 
        verificationLevel: "basic" as const
      },
      votes: 287,
    },
  ];

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
        <Tabs defaultValue="top">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Positions</h2>
            <TabsList>
              <TabsTrigger value="top">Top</TabsTrigger>
              <TabsTrigger value="new">Newest</TabsTrigger>
              <TabsTrigger value="verified">Verified Only</TabsTrigger>
            </TabsList>
          </div>

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
      </div>
    </Layout>
  );
};

export default IssueDetail;
