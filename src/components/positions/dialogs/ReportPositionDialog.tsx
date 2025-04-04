
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AtSign, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ReportPositionDialogProps {
  positionId: string;
  positionTitle: string;
  positionContent: string;
  issueId?: string;
  issueTitle?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ReportPositionDialog = ({
  positionId,
  positionTitle,
  positionContent,
  issueId,
  issueTitle = "this issue",
  open,
  onOpenChange
}: ReportPositionDialogProps) => {
  const { isAuthenticated, signIn, session } = useAuth();
  const [reportReason, setReportReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Sign in form state
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [showAuthSuccess, setShowAuthSuccess] = useState(false);

  const handleReport = async () => {
    if (!isAuthenticated) {
      setIsSigningIn(true);
      return;
    }
    
    if (!reportReason.trim()) {
      toast.error("Please provide a reason for reporting this position");
      return;
    }

    setIsSubmitting(true);

    try {
      // We need to pass the auth token for the edge function to identify the user
      const { error } = await supabase.functions.invoke("send-position-report", {
        body: {
          positionId,
          positionTitle,
          positionContent,
          issueId,
          issueTitle,
          reportReason,
        },
        headers: session?.access_token
          ? { Authorization: `Bearer ${session.access_token}` }
          : undefined,
      });

      if (error) throw error;

      toast.success("Report submitted successfully");
      setReportReason("");
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error submitting report:", error);
      toast.error("Failed to submit report. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setAuthError("");
    
    try {
      await signIn(email, password);
      setShowAuthSuccess(true);
      
      // Reset auth form fields
      setEmail("");
      setPassword("");
      
      // Show success message briefly then return to report form
      setTimeout(() => {
        setShowAuthSuccess(false);
        setIsSigningIn(false);
      }, 2000);
    } catch (error: any) {
      setAuthError(error.message || "Failed to sign in");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleBackToReport = () => {
    setIsSigningIn(false);
    setAuthError("");
  };

  // Render sign-in form
  if (isSigningIn && !isAuthenticated) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sign in to submit report</DialogTitle>
          </DialogHeader>
          
          {showAuthSuccess ? (
            <div className="py-6 text-center">
              <p className="text-green-600 font-medium mb-2">Successfully signed in!</p>
              <p>Returning to your report...</p>
            </div>
          ) : (
            <form onSubmit={handleSignIn} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <AtSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="youremail@example.com"
                    className="pl-9"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password" 
                    className="pl-9"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              {authError && (
                <p className="text-destructive text-sm">{authError}</p>
              )}
              <DialogFooter className="sm:justify-between">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleBackToReport}
                  disabled={isSubmitting}
                >
                  Back
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Signing in..." : "Sign in"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    );
  }

  // Render report form
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Report Position</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <Textarea 
            placeholder="Please describe why you're reporting this position..."
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            className="min-h-[100px]"
            disabled={!isAuthenticated}
          />
          {!isAuthenticated && (
            <p className="text-sm text-muted-foreground">
              You must sign in to submit a report
            </p>
          )}
        </div>
        <DialogFooter className="sm:justify-between">
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={isSubmitting}>
              Cancel
            </Button>
          </DialogClose>
          <Button onClick={handleReport} disabled={isSubmitting}>
            {isAuthenticated 
              ? (isSubmitting ? "Submitting..." : "Submit Report") 
              : "Sign in to Submit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReportPositionDialog;
