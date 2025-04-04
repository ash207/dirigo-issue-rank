
import { useState } from "react";
import { AtSign, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";

interface PositionAuthFormProps {
  onSignIn: (email: string, password: string) => Promise<void>;
  onBack: () => void;
  isSubmitting: boolean;
  authError: string;
  showAuthSuccess: boolean;
}

const PositionAuthForm = ({
  onSignIn,
  onBack,
  isSubmitting,
  authError,
  showAuthSuccess
}: PositionAuthFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSignIn(email, password);
  };

  if (showAuthSuccess) {
    return (
      <div className="py-6 text-center">
        <p className="text-green-600 font-medium mb-2">Successfully signed in!</p>
        <p>Returning to your report...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
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
          onClick={onBack}
          disabled={isSubmitting}
        >
          Back
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Signing in..." : "Sign in"}
        </Button>
      </DialogFooter>
    </form>
  );
};

export default PositionAuthForm;
