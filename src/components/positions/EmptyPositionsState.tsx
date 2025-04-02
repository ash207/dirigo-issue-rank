
import React from "react";

const EmptyPositionsState: React.FC = () => {
  return (
    <div className="text-center py-6 bg-slate-50 rounded-lg mt-4 mb-6">
      <h3 className="text-lg font-medium mb-2">No positions yet</h3>
      <p className="text-muted-foreground">Be the first to add your position on this issue!</p>
    </div>
  );
};

export default EmptyPositionsState;
