
import { Input } from "@/components/ui/input";
import { FormLabel } from "@/components/ui/form";
import { SelectedTemplateType } from "./EmailTemplateSelector";

interface TemplateConfigurationProps {
  selectedTemplate: SelectedTemplateType;
  recipientName: string;
  confirmationLink: string;
  onRecipientNameChange: (name: string) => void;
  onConfirmationLinkChange: (link: string) => void;
}

const TemplateConfiguration = ({
  selectedTemplate,
  recipientName,
  confirmationLink,
  onRecipientNameChange,
  onConfirmationLinkChange,
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
          <FormLabel>Confirmation/Reset Link</FormLabel>
          <Input
            placeholder="https://example.com/confirm?token=..."
            value={confirmationLink}
            onChange={(e) => onConfirmationLinkChange(e.target.value)}
          />
        </div>
      )}
    </div>
  );
};

export default TemplateConfiguration;
