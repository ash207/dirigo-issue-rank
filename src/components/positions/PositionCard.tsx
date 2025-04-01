
import { Card, CardContent } from "@/components/ui/card";

interface PositionCardProps {
  id: string;
  title: string;
  content: string;
  author: {
    name: string;
    verificationLevel: "unverified" | "basic" | "voter" | "official";
  };
  votes: number;
}

const PositionCard = ({ 
  content,
  title
}: PositionCardProps) => {
  return (
    <Card className="mb-4">
      <CardContent className="pt-6 pb-6">
        <h3 className="font-bold text-lg mb-2">{title}</h3>
        <p className="text-gray-700">{content}</p>
      </CardContent>
    </Card>
  );
};

export default PositionCard;
