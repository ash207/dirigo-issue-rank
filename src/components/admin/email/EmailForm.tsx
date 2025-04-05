
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { emailTemplates } from "@/services/auth/adminService";
import { Form } from "@/components/ui/form";
import EmailTemplateSelector, { SelectedTemplateType } from "./EmailTemplateSelector";
import TemplateConfiguration from "./TemplateConfiguration";
import EmailPreview from "./EmailPreview";
import EmailRecipientField from "./EmailRecipientField";
import EmailSubjectField from "./EmailSubjectField";
import EmailContentField from "./EmailContentField";
import EmailFormActions from "./EmailFormActions";

// Form schema for email sending
const emailFormSchema = z.object({
  recipient: z.string().email("Please enter a valid email address"),
  subject: z.string().min(1, "Subject is required"),
  content: z.string().min(1, "Email content is required"),
});

export type EmailFormValues = z.infer<typeof emailFormSchema>;

interface EmailFormProps {
  onSubmit: (data: EmailFormValues) => Promise<void>;
  isSending: boolean;
}

const EmailForm = ({ onSubmit, isSending }: EmailFormProps) => {
  const [openPreview, setOpenPreview] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<SelectedTemplateType>("custom");
  const [recipientName, setRecipientName] = useState("");
  const [confirmationLink, setConfirmationLink] = useState("#");

  // Initialize the form
  const form = useForm<EmailFormValues>({
    resolver: zodResolver(emailFormSchema),
    defaultValues: {
      recipient: "",
      subject: "",
      content: "",
    },
  });

  // Apply a template to the form
  const applyTemplate = (template: keyof typeof emailTemplates) => {
    const selectedTemplate = emailTemplates[template];
    let htmlContent = "";
    
    // Generate HTML content based on the template
    switch (template) {
      case "welcome":
        htmlContent = selectedTemplate.getHtml(recipientName);
        break;
      case "accountConfirmation":
        htmlContent = selectedTemplate.getHtml(recipientName, confirmationLink);
        break;
      case "passwordReset":
        htmlContent = selectedTemplate.getHtml(recipientName, confirmationLink);
        break;
      default:
        htmlContent = "";
    }
    
    form.setValue("subject", selectedTemplate.subject);
    form.setValue("content", htmlContent);
  };

  // Handle template selection
  const handleTemplateChange = (value: SelectedTemplateType) => {
    setSelectedTemplate(value);
    
    if (value === "custom") {
      form.setValue("subject", "");
      form.setValue("content", "");
    } else {
      applyTemplate(value);
    }
  };

  // Handle template configuration changes
  const handleRecipientNameChange = (name: string) => {
    setRecipientName(name);
    if (selectedTemplate !== "custom") {
      applyTemplate(selectedTemplate);
    }
  };

  const handleConfirmationLinkChange = (link: string) => {
    setConfirmationLink(link);
    if (selectedTemplate !== "custom") {
      applyTemplate(selectedTemplate);
    }
  };

  const handleOpenPreview = () => {
    setOpenPreview(true);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Template Selector */}
        <div className="space-y-2">
          <EmailTemplateSelector
            selectedTemplate={selectedTemplate}
            onTemplateChange={handleTemplateChange}
          />
        </div>

        {/* Template Configuration */}
        {selectedTemplate !== "custom" && (
          <TemplateConfiguration
            selectedTemplate={selectedTemplate}
            recipientName={recipientName}
            confirmationLink={confirmationLink}
            onRecipientNameChange={handleRecipientNameChange}
            onConfirmationLinkChange={handleConfirmationLinkChange}
          />
        )}

        {/* Form Fields */}
        <EmailRecipientField control={form.control} />
        <EmailSubjectField control={form.control} />
        <EmailContentField control={form.control} />
        
        {/* Email Preview */}
        <EmailPreview
          open={openPreview}
          onOpenChange={setOpenPreview}
          recipient={form.getValues("recipient")}
          subject={form.getValues("subject")}
          content={form.getValues("content")}
        />
        
        {/* Form Actions */}
        <EmailFormActions 
          isSending={isSending}
          onReset={() => form.reset()}
          openPreview={handleOpenPreview}
        />
      </form>
    </Form>
  );
};

export default EmailForm;
