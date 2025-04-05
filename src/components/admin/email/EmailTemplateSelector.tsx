
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { emailTemplates } from "@/services/auth/adminService";

// Template options, matching the keys in emailTemplates
type TemplateKey = keyof typeof emailTemplates;
const templateOptions: TemplateKey[] = Object.keys(emailTemplates) as TemplateKey[];

// Define a type that includes both TemplateKey and "custom"
export type SelectedTemplateType = TemplateKey | "custom";

interface EmailTemplateSelectorProps {
  selectedTemplate: SelectedTemplateType;
  onTemplateChange: (value: SelectedTemplateType) => void;
}

const EmailTemplateSelector = ({
  selectedTemplate,
  onTemplateChange,
}: EmailTemplateSelectorProps) => {
  return (
    <div className="space-y-2">
      <Select
        value={selectedTemplate}
        onValueChange={(value) => onTemplateChange(value as SelectedTemplateType)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select a template or create custom email" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="custom">Custom Email</SelectItem>
          {templateOptions.map((template) => (
            <SelectItem key={template} value={template}>
              {template.replace(/([A-Z])/g, ' $1').trim().split(' ').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
              ).join(' ')}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default EmailTemplateSelector;
