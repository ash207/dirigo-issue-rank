
import React from "react";

const IssueErrorState: React.FC = () => {
  return (
    <div className="container mx-auto max-w-4xl py-8 text-center">
      <h2 className="text-2xl font-bold mb-4">Issue not found</h2>
      <p className="mb-4">The issue you're looking for doesn't exist or you don't have permission to view it.</p>
    </div>
  );
};

export default IssueErrorState;
