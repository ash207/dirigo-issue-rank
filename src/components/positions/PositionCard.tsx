
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PositionCardProps {
  id: string;
  title: string;
  content: string;
  author: {
    name: string;
    verificationLevel: "unverified" | "basic" | "voter" | "official";
  };
  votes: number;
  ranking?: number;
  isDraggable?: boolean;
  onDragStart?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop?: (e: React.DragEvent<HTMLDivElement>) => void;
}

const PositionCard = ({ 
  id,
  content,
  title,
  author,
  votes,
  ranking,
  isDraggable = false,
  onDragStart,
  onDragOver,
  onDrop
}: PositionCardProps) => {
  return (
    <Card 
      className={`mb-4 relative ${isDraggable ? 'cursor-move' : ''}`}
      draggable={isDraggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      data-position-id={id}
    >
      {ranking && (
        <div className="absolute -left-2 -top-2 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shadow-md">
          {ranking}
        </div>
      )}
      <CardContent className="pt-6 pb-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg">{title}</h3>
          <span className={`text-verification-${author.verificationLevel} text-sm`}>
            @{author.name}
          </span>
        </div>
        <p className="text-gray-700 mb-3">{content}</p>
        <div className="flex justify-between items-center">
          <Badge variant="outline">{votes} votes</Badge>
          <span className="text-xs text-muted-foreground">
            Verification Level: {author.verificationLevel}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default PositionCard;
