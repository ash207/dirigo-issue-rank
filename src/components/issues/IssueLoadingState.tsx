
import React from "react";

const IssueLoadingState: React.FC = () => {
  return (
    <div className="container mx-auto max-w-4xl py-8">
      <div className="animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-slate-200 rounded w-1/2 mb-2"></div>
        <div className="h-24 bg-slate-200 rounded mb-4"></div>
      </div>
    </div>
  );
};

export default IssueLoadingState;
