
import { Input } from "@/components/ui/input";
import { FormLabel } from "@/components/ui/form";
import { SelectedTemplateType } from "./EmailTemplateSelector";
import { Loader2 } from "lucide-react";

interface TemplateConfigurationProps {
  selectedTemplate: SelectedTemplateType;
  recipientName: string;
  confirmationLink: string;
  onRecipientNameChange: (name: string) => void;
  onConfirmationLinkChange: (link: string) => void;
  isGeneratingLink?: boolean;
  isPendingUser?: boolean;
}

const TemplateConfiguration = ({
  selectedTemplate,
  recipientName,
  confirmationLink,
  onRecipientNameChange,
  onConfirmationLinkChange,
  isGeneratingLink = false,
  isPendingUser = false,
}: TemplateConfigurationProps) => {
  if (selectedTemplate === "custom") {
    return null;
  }

  return (
    <div className="space-y-4 border p-4 rounded-md bg-slate-50">
      <h3 className="font-medium">Template Configuration</h3>
      
      <div className="space-y-2">
        <FormLabel>Recipient Name</FormLabel>
        <Input
          placeholder="Recipient's name"
          value={recipientName}
          onChange={(e) => onRecipientNameChange(e.target.value)}
        />
      </div>
      
      {(selectedTemplate === "accountConfirmation" || selectedTemplate === "passwordReset") && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <FormLabel>Confirmation/Reset Link</FormLabel>
            {isGeneratingLink && (
              <div className="flex items-center text-xs text-blue-600">
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
                Generating link...
              </div>
            )}
            {isPendingUser && selectedTemplate === "accountConfirmation" && !isGeneratingLink && confirmationLink !== "#" && (
              <div className="text-xs text-green-600">Auto-generated for pending user</div>
            )}
          </div>
          <Input
            placeholder="https://example.com/confirm?token=..."
            value={confirmationLink}
            onChange={(e) => onConfirmationLinkChange(e.target.value)}
            className={isPendingUser && selectedTemplate === "accountConfirmation" ? "border-green-300 focus-visible:ring-green-300" : ""}
            disabled={isGeneratingLink}
          />
        </div>
      )}
    </div>
  );
};

export default TemplateConfiguration;
