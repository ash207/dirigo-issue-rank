
import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Shield } from "lucide-react";

export type VotePrivacyLevel = "public" | "anonymous" | "super_anonymous";

interface VotePrivacyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (privacyLevel: VotePrivacyLevel) => void;
  positionTitle: string;
}

const VotePrivacyDialog = ({
  open,
  onOpenChange,
  onConfirm,
  positionTitle,
}: VotePrivacyDialogProps) => {
  const [selectedPrivacy, setSelectedPrivacy] = useState<VotePrivacyLevel>("public");

  const handleConfirm = () => {
    onConfirm(selectedPrivacy);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Choose Vote Privacy Level</DialogTitle>
          <DialogDescription>
            Select how you want your vote for "{positionTitle}" to be handled
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <RadioGroup
            value={selectedPrivacy}
            onValueChange={(value) => setSelectedPrivacy(value as VotePrivacyLevel)}
            className="space-y-4"
          >
            <div className="flex items-start space-x-3 space-y-0 rounded-md border p-4 hover:bg-muted/50">
              <RadioGroupItem value="public" id="public" className="mt-1" />
              <div className="flex flex-col space-y-1">
                <Label htmlFor="public" className="flex items-center gap-2 font-medium">
                  <Eye className="h-4 w-4" />
                  Public
                </Label>
                <p className="text-sm text-muted-foreground">
                  Your vote will be visible to others. This helps build transparency in the community.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 space-y-0 rounded-md border p-4 hover:bg-muted/50">
              <RadioGroupItem value="anonymous" id="anonymous" className="mt-1" />
              <div className="flex flex-col space-y-1">
                <Label htmlFor="anonymous" className="flex items-center gap-2 font-medium">
                  <EyeOff className="h-4 w-4" />
                  Anonymous
                </Label>
                <p className="text-sm text-muted-foreground">
                  Your vote will be hidden from other users, but accessible to Dirigo Votes admins to improve your experience.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 space-y-0 rounded-md border p-4 hover:bg-muted/50">
              <RadioGroupItem value="super_anonymous" id="super_anonymous" className="mt-1" />
              <div className="flex flex-col space-y-1">
                <Label htmlFor="super_anonymous" className="flex items-center gap-2 font-medium">
                  <Shield className="h-4 w-4" />
                  Super Anonymous
                </Label>
                <p className="text-sm text-muted-foreground">
                  Your vote will be completely private. No database record will link your identity to this vote, making it inaccessible even to site administrators.
                </p>
              </div>
            </div>
          </RadioGroup>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>
            Confirm Vote
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VotePrivacyDialog;
