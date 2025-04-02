
import React from "react";
import { MessageSquareOff } from "lucide-react";

const EmptyPositionsState: React.FC = () => {
  return (
    <div className="flex flex-col items-center text-center py-10 px-6 bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl shadow-sm mt-4 mb-6 border border-blue-100">
      <div className="bg-blue-100 p-4 rounded-full mb-4">
        <MessageSquareOff size={28} className="text-dirigo-blue opacity-80" />
      </div>
      <h3 className="text-xl font-semibold mb-2">No positions yet</h3>
      <p className="text-muted-foreground max-w-md">
        Be the first to add your position on this issue and start the conversation!
      </p>
    </div>
  );
};

export default EmptyPositionsState;
