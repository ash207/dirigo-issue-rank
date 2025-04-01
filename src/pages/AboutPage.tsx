
import Layout from "@/components/layout/Layout";

const AboutPage = () => {
  return (
    <Layout>
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">About Dirigo Votes</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A new approach to political discourse and civic engagement
          </p>
        </div>

        <div className="prose prose-lg max-w-none">
          <h2>Our Mission</h2>
          <p>
            Dirigo Votes is built on the belief that democracy thrives when citizens can engage in productive, issue-focused dialogue. 
            Our mission is to create a space where people can explore political issues through multiple perspectives, 
            understand the nuances of complex topics, and collectively work toward solutions.
          </p>
          
          <h2>Why "Dirigo"?</h2>
          <p>
            "Dirigo" is the state motto of Maine, Latin for "I lead." We chose this name because it embodies our vision: 
            a platform where everyday citizens take leadership in shaping the political conversation. In the same way that 
            Maine has been a pioneer in electoral innovations like ranked choice voting, we aim to pioneer new approaches to 
            online political engagement.
          </p>

          <h2>How We're Different</h2>
          <p>
            Unlike traditional social media platforms that amplify division through post-and-comment structures, Dirigo Votes is organized around:
          </p>
          <ul>
            <li><strong>Issues</strong> - Clearly defined questions or statements about matters of public concern</li>
            <li><strong>Positions</strong> - Structured responses that offer perspectives or solutions on issues</li>
            <li><strong>Ranked Choice Voting</strong> - Users can rank positions to surface the most broadly acceptable solutions</li>
            <li><strong>Identity Verification</strong> - Multiple levels of verification create accountability and highlight relevant voices</li>
          </ul>

          <h2>Our Values</h2>
          <p>
            Dirigo Votes is guided by these core values:
          </p>
          <ul>
            <li><strong>Productive Discourse</strong> - We value substantive discussion over inflammatory rhetoric</li>
            <li><strong>Diverse Perspectives</strong> - We welcome all viewpoints expressed respectfully</li>
            <li><strong>Informed Participation</strong> - We provide context and resources to help users understand complex issues</li>
            <li><strong>Democratic Innovation</strong> - We experiment with new ways for citizens to engage with each other and their representatives</li>
            <li><strong>User Privacy</strong> - We protect user data and provide transparent verification options</li>
          </ul>

          <h2>Join Us</h2>
          <p>
            Dirigo Votes is still growing and evolving. We welcome your participation, feedback, and ideas as we build a platform that 
            serves democracy in the digital age. Whether you're a concerned citizen, a policy expert, or an elected official, 
            there's a place for your voice here.
          </p>

          <div className="bg-dirigo-blue text-white p-6 rounded-lg my-8 text-center">
            <h3 className="text-xl font-bold mb-2">Get Started Today</h3>
            <p className="mb-4">
              Create an account, verify your identity, and start engaging with the issues that matter most to you.
            </p>
            <button className="bg-white text-dirigo-blue px-6 py-2 rounded-md font-bold hover:bg-opacity-90">
              Sign Up Now
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AboutPage;
