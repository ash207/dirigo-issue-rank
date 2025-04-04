
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/auth";
import Index from "./pages/Index";
import IssuesPage from "./pages/IssuesPage";
import IssueDetail from "./pages/IssueDetail";
import CreateIssuePage from "./pages/CreateIssuePage";
import EditIssuePage from "./pages/EditIssuePage";
import ProfilePage from "./pages/ProfilePage";
import VerificationPage from "./pages/VerificationPage";
import AboutPage from "./pages/AboutPage";
import NotFound from "./pages/NotFound";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/issues" element={<IssuesPage />} />
            <Route path="/issues/:id" element={<IssueDetail />} />
            <Route path="/issues/create" element={<CreateIssuePage />} />
            <Route path="/issues/edit/:id" element={<EditIssuePage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/verify" element={<VerificationPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/sign-in" element={<SignInPage />} />
            <Route path="/sign-up" element={<SignUpPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
