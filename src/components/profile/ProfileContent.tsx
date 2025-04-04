
import { useState } from "react";
import { Book, MessageSquare } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IssuesTab } from "./IssuesTab";
import { PositionsTab } from "./PositionsTab";
import { Issue } from "@/types/issue";
import { Position } from "@/types/position";

type ProfileContentProps = {
  issues: Issue[];
  positions: Position[];
  isLoading: boolean;
};

export const ProfileContent = ({ issues, positions, isLoading }: ProfileContentProps) => {
  const [activeTab, setActiveTab] = useState("issues");
  
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="issues" className="flex items-center space-x-2">
          <Book className="h-4 w-4" />
          <span>My Issues ({issues.length})</span>
        </TabsTrigger>
        <TabsTrigger value="positions" className="flex items-center space-x-2">
          <MessageSquare className="h-4 w-4" />
          <span>My Positions ({positions.length})</span>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="issues">
        <IssuesTab issues={issues} isLoading={isLoading} />
      </TabsContent>
      
      <TabsContent value="positions">
        <PositionsTab positions={positions} isLoading={isLoading} />
      </TabsContent>
    </Tabs>
  );
};
