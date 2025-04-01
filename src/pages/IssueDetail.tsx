
import { useParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/contexts/AuthContext";
import IssueHeader from "@/components/issues/IssueHeader";
import PositionsList from "@/components/positions/PositionsList";
import usePositionVotes from "@/hooks/usePositionVotes";

const IssueDetail = () => {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuth();
  const { userVotedPosition, handleVote } = usePositionVotes(id, user?.id, isAuthenticated);
  
  // Mock data with UUID-formatted IDs for better Supabase compatibility
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
      id: "e7f8a7b6-d2c3-4a5b-9c8d-e7f6a5b4c3d2", // Mock UUID format
      title: "Support for $15 Minimum Wage",
      content: "Yes, the minimum wage should be $15/hour nationwide. Workers need a living wage, and studies show minimal impact on overall employment with significant benefits to the economy through increased consumer spending.",
      author: { 
        name: "SenatorSmith", 
        verificationLevel: "official" as const
      },
      votes: 532,
    },
    {
      id: "a1b2c3d4-e5f6-7a8b-9c0d-e1f2a3b4c5d6", // Mock UUID format
      title: "Gradual Phased Implementation",
      content: "I believe we need a minimum wage increase, but it should be phased in gradually and adjusted based on regional cost of living to minimize negative impacts on small businesses in lower-cost areas.",
      author: { 
        name: "EconomistJones", 
        verificationLevel: "voter" as const
      },
      votes: 421,
    },
    {
      id: "f1e2d3c4-b5a6-7c8d-9e0f-a1b2c3d4e5f6", // Mock UUID format
      title: "Opposition to Nationwide Increase",
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
        <IssueHeader issue={issue} positionsCount={positions.length} />
        
        <PositionsList 
          positions={positions}
          issueId={id || ""}
          isAuthenticated={isAuthenticated}
          userVotedPosition={userVotedPosition}
          onVote={handleVote}
        />
      </div>
    </Layout>
  );
};

export default IssueDetail;
