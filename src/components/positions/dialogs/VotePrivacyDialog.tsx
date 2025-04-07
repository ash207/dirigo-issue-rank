
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
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Vote Privacy Options</DialogTitle>
          <DialogDescription>
            Choose how your vote for <span className="font-medium">{positionTitle}</span> will be recorded and who can see it.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <RadioGroup 
            value={selectedPrivacy} 
            onValueChange={(value) => setSelectedPrivacy(value as VotePrivacyLevel)}
            className="space-y-4"
          >
            <div className="flex items-start space-x-3 space-y-0 p-2 rounded-md hover:bg-muted/50">
              <RadioGroupItem value="public" id="public" />
              <div className="grid gap-1.5">
                <Label htmlFor="public" className="font-medium">Public Vote</Label>
                <p className="text-sm text-muted-foreground">
                  Your vote will be visible to others. Your name may appear in public voting records.
                  You can change or remove your vote at any time.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 space-y-0 p-2 rounded-md hover:bg-muted/50">
              <RadioGroupItem value="private" id="private" />
              <div className="grid gap-1.5">
                <Label htmlFor="private" className="font-medium">Private Vote</Label>
                <p className="text-sm text-muted-foreground">
                  Only you can see that you voted. Your vote is still counted in the totals,
                  but no one else will know how you voted. You can change or remove your vote later.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 space-y-0 p-2 rounded-md hover:bg-muted/50">
              <RadioGroupItem value="super_anonymous" id="super_anonymous" />
              <div className="grid gap-1.5">
                <Label htmlFor="super_anonymous" className="font-medium">Super Anonymous</Label>
                <p className="text-sm text-muted-foreground">
                  Your vote cannot be traced back to you at all. Not even the system will store a connection
                  between you and your vote. <span className="font-medium text-amber-600">Important: You cannot change or remove this vote later.</span>
                </p>
              </div>
            </div>
          </RadioGroup>
        </div>

        <DialogFooter className="flex gap-2 sm:gap-0">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
          >
            Vote with {selectedPrivacy === 'public' ? 'Public' : selectedPrivacy === 'private' ? 'Private' : 'Super Anonymous'} Setting
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VotePrivacyDialog;
