
import { Button } from "@/components/ui/button";

interface EmailFormActionsProps {
  isSending: boolean;
  onReset: () => void;
  openPreview: () => void;
}

const EmailFormActions = ({ isSending, onReset, openPreview }: EmailFormActionsProps) => {
  return (
    <div className="flex justify-between gap-2">
      <Button
        type="button"
        variant="outline"
        onClick={onReset}
      >
        Reset
      </Button>
      
      <div className="flex space-x-2">
        <Button
          type="button" 
          variant="outline"
          onClick={openPreview}
        >
          Preview
        </Button>
        
        <Button 
          type="submit" 
          disabled={isSending}
          className="bg-dirigo-blue hover:bg-dirigo-blue/90"
        >
          {isSending ? "Sending..." : "Send Email"}
        </Button>
      </div>
    </div>
  );
};

export default EmailFormActions;
