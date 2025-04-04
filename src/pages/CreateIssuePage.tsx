
import Layout from "@/components/layout/Layout";
import CreateIssueForm from "@/components/issues/CreateIssueForm";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

const CreateIssuePage = () => {
  const { isAuthenticated } = useAuth();

  // Redirect to sign in if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/sign-in" replace />;
  }

  return (
    <Layout>
      <div className="container mx-auto max-w-2xl py-8">
        <h1 className="text-3xl font-bold mb-8">Create New Issue</h1>
        <CreateIssueForm />
      </div>
    </Layout>
  );
};

export default CreateIssuePage;
