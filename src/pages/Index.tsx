
import { Button } from "@/components/ui/button";
import Layout from "@/components/layout/Layout";
import { Link } from "react-router-dom";
import IssueCard from "@/components/issues/IssueCard";
import SendTestEmailButton from "@/components/email/SendTestEmailButton";

const Index = () => {
  // Mock data for featured issues
  const featuredIssues = [
    { id: "1", title: "Should the minimum wage be increased to $15/hour nationwide?", category: "Federal", votes: 1240, positions: 23 },
    { id: "2", title: "Is expanding public transportation in our city worth the investment?", category: "Local", votes: 864, positions: 15 },
    { id: "3", title: "Should our state implement stricter water conservation measures?", category: "State", votes: 932, positions: 18 }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-12 md:py-20 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          <span className="text-dirigo-blue">Democracy</span> is a 
          <span className="text-dirigo-red"> Conversation</span>
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Join a community focused on issues, not arguments. Explore positions, 
          rank your priorities, and make your voice heard.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button asChild size="lg" className="bg-dirigo-blue hover:bg-dirigo-blue/90">
            <Link to="/issues">Explore Issues</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-dirigo-red text-dirigo-red hover:bg-dirigo-red/10">
            <Link to="/verify">Get Verified</Link>
          </Button>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12 bg-gray-50 rounded-lg my-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How Dirigo Votes Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-4">
              <div className="bg-dirigo-blue text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-bold mb-2">Explore Issues</h3>
              <p>Browse through issues that matter to you and your community, from local to national concerns.</p>
            </div>
            <div className="text-center p-4">
              <div className="bg-dirigo-blue text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-bold mb-2">Take Positions</h3>
              <p>Share your perspective or vote on existing positions to help elevate the best solutions.</p>
            </div>
            <div className="text-center p-4">
              <div className="bg-dirigo-blue text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-bold mb-2">Get Verified</h3>
              <p>Verify your identity to increase your influence and participate in more meaningful ways.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Issues */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Featured Issues</h2>
            <Button variant="link" asChild>
              <Link to="/issues">View all issues</Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredIssues.map(issue => (
              <IssueCard key={issue.id} {...issue} />
            ))}
          </div>
        </div>
      </section>

      {/* Get Involved CTA */}
      <section className="py-12 bg-dirigo-blue text-white rounded-lg my-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to make your voice heard?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of Americans engaging in meaningful political discourse and shaping the future of our democracy.
          </p>
          <Button asChild size="lg" className="bg-dirigo-white text-dirigo-blue hover:bg-dirigo-white/90">
            <Link to="/sign-up">Sign Up Now</Link>
          </Button>
        </div>
      </section>
      
      {/* Test Email Section - only shown to authenticated users */}
      <section className="py-8 text-center">
        <SendTestEmailButton />
      </section>
    </Layout>
  );
};

export default Index;
