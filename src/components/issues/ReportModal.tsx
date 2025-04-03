
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AtSign, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";

interface ReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  issueId: string;
  issueTitle: string;
}

const ReportModal = ({ open, onOpenChange, issueId, issueTitle }: ReportModalProps) => {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isAuthenticated, signIn } = useAuth();
  
  // Sign in form state
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [showAuthSuccess, setShowAuthSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      setIsSigningIn(true);
      return;
    }
    
    if (!reason.trim()) {
      toast.error("Please provide a reason for reporting this issue");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.functions.invoke("send-report", {
        body: {
          issueId,
          issueTitle,
          reportReason: reason,
        },
      });

      if (error) throw error;

      toast.success("Report submitted successfully");
      setReason("");
      onOpenChange(false);
    } catch (error) {
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
          <DialogTitle>Report Issue</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <Textarea 
            placeholder="Please describe why you're reporting this issue..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
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
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isAuthenticated 
              ? (isSubmitting ? "Submitting..." : "Submit Report") 
              : "Sign in to Submit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReportModal;
