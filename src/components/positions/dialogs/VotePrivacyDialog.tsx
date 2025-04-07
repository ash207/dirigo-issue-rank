
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

// Export type separately for use in other files
export type VotePrivacyLevel = 'public' | 'private' | 'super_anonymous';

interface VotePrivacyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPrivacySelected: (privacyLevel: VotePrivacyLevel) => void;
  positionTitle?: string;
}

const VotePrivacyDialog = ({
  open,
  onOpenChange,
  onPrivacySelected,
  positionTitle = "this position"
}: VotePrivacyDialogProps) => {
  const [selectedPrivacy, setSelectedPrivacy] = useState<VotePrivacyLevel>('public');

  const handleSubmit = () => {
    onPrivacySelected(selectedPrivacy);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Choose your vote privacy</DialogTitle>
          <DialogDescription>
            Select how you want your vote for {positionTitle} to be recorded.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <RadioGroup 
            value={selectedPrivacy} 
            onValueChange={(value) => setSelectedPrivacy(value as VotePrivacyLevel)}
            className="space-y-4"
          >
            <div className="flex items-start space-x-3 space-y-0">
              <RadioGroupItem value="public" id="public" />
              <div className="grid gap-1.5">
                <Label htmlFor="public" className="font-medium">Public</Label>
                <p className="text-sm text-muted-foreground">
                  Your vote will be visible to others and can be changed later.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 space-y-0">
              <RadioGroupItem value="private" id="private" />
              <div className="grid gap-1.5">
                <Label htmlFor="private" className="font-medium">Private</Label>
                <p className="text-sm text-muted-foreground">
                  Only you can see your vote, but it can be changed later.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 space-y-0">
              <RadioGroupItem value="super_anonymous" id="super_anonymous" />
              <div className="grid gap-1.5">
                <Label htmlFor="super_anonymous" className="font-medium">Super Anonymous</Label>
                <p className="text-sm text-muted-foreground">
                  Your vote cannot be traced back to you, but it cannot be changed later.
                </p>
              </div>
            </div>
          </RadioGroup>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
          >
            Vote
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VotePrivacyDialog;
