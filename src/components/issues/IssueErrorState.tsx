
import React from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "../ui/button";
import { Link } from "react-router-dom";

const IssueErrorState: React.FC = () => {
  return (
    <div className="container mx-auto max-w-4xl py-12 text-center animate-fade-in-up">
      <div className="bg-red-50 border border-red-100 rounded-lg p-8 shadow-sm">
        <div className="flex justify-center mb-4">
          <div className="bg-red-100 p-3 rounded-full">
            <AlertCircle size={32} className="text-secondary" />
          </div>
        </div>
        <h2 className="text-2xl font-bold mb-4">Issue not found</h2>
        <p className="mb-6 text-muted-foreground max-w-md mx-auto">
          The issue you're looking for doesn't exist or you don't have permission to view it.
        </p>
        <Button asChild className="bg-dirigo-blue">
          <Link to="/issues">Browse all issues</Link>
        </Button>
      </div>
    </div>
  );
};

export default IssueErrorState;
