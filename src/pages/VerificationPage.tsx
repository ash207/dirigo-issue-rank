
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check } from "lucide-react";

const VerificationPage = () => {
  const verificationLevels = [
    {
      title: "Basic Verification",
      description: "Verify your email and basic identity information",
      benefits: [
        "Create and comment on issues",
        "Vote on positions",
        "Create your own positions"
      ],
      buttonText: "Get Basic Verification",
      color: "verification-basic"
    },
    {
      title: "Voter Verification",
      description: "Verify that you're a registered voter in your location",
      benefits: [
        "All Basic Verification benefits",
        "Vote in official polls",
        "Filter for voter-only content",
        "Higher ranking weight for your votes"
      ],
      buttonText: "Verify Voter Status",
      color: "verification-voter"
    },
    {
      title: "Official Verification",
      description: "Verify your status as an elected official or candidate",
      benefits: [
        "All Voter Verification benefits",
        "Official badge on your profile",
        "Featured positions on relevant issues",
        "Create official statements"
      ],
      buttonText: "Apply for Official Status",
      color: "verification-official"
    }
  ];

  return (
    <Layout>
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4">User Verification</h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Verify your identity to gain additional privileges and contribute more meaningfully to the political discourse.
          </p>
        </div>

        <div className="space-y-6">
          {verificationLevels.map((level, index) => (
            <Card key={index} className={`border-l-4 border-${level.color}`}>
              <CardHeader>
                <CardTitle className={`text-${level.color}`}>{level.title}</CardTitle>
                <CardDescription>{level.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {level.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-start">
                      <Check size={18} className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button className={`bg-${level.color} hover:bg-${level.color}/90 w-full`}>
                  {level.buttonText}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-12 bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">About Verification</h2>
          <p className="text-gray-700 mb-4">
            At Dirigo Votes, we believe that verified identity helps create meaningful political discourse. 
            Our verification system is designed to balance accessibility with the need for authentic participation.
          </p>
          <p className="text-gray-700 mb-4">
            For voter verification, we work with state voter registration databases to confirm your status. 
            All personal information is handled securely and privately in accordance with our privacy policy.
          </p>
          <p className="text-gray-700">
            Official verification requires submission of credentials and goes through a manual review process. 
            This ensures that public officials and candidates can be properly recognized on our platform.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default VerificationPage;
