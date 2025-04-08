
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ShieldAlert } from "lucide-react";

// Export type separately for use in other files
export type VotePrivacyLevel = 'public' | 'ghost';

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
              <RadioGroupItem value="ghost" id="ghost" />
              <div className="grid gap-1.5">
                <Label htmlFor="ghost" className="font-medium">Ghost Vote (Truly Anonymous)</Label>
                <p className="text-sm text-muted-foreground">
                  Your vote cannot be traced back to you. No record of who cast this vote
                  is stored anywhere in the system, ensuring complete anonymity.
                </p>
                {selectedPrivacy === 'ghost' && (
                  <Alert className="mt-2 bg-amber-50 text-amber-900 border-amber-200">
                    <ShieldAlert className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-xs">
                      <strong>Important:</strong> Since ghost votes are completely anonymous, you cannot change or remove them later. 
                      The system does not track which users cast ghost votes.
                    </AlertDescription>
                  </Alert>
                )}
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
            Vote with {selectedPrivacy === 'public' ? 'Public' : 'Ghost'} Setting
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VotePrivacyDialog;
