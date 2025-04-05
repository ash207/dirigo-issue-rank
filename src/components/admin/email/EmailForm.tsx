
import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { emailTemplates, generateConfirmationLink } from "@/services/auth/adminService";
import { Form } from "@/components/ui/form";
import EmailTemplateSelector, { SelectedTemplateType } from "./EmailTemplateSelector";
import TemplateConfiguration from "./TemplateConfiguration";
import EmailPreview from "./EmailPreview";
import EmailRecipientField from "./EmailRecipientField";
import EmailSubjectField from "./EmailSubjectField";
import EmailContentField from "./EmailContentField";
import EmailFormActions from "./EmailFormActions";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

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
  const { session } = useAuth();
  const [openPreview, setOpenPreview] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<SelectedTemplateType>("custom");
  const [recipientName, setRecipientName] = useState("");
  const [confirmationLink, setConfirmationLink] = useState("#");
  const [userStatus, setUserStatus] = useState<string | null>(null);
  const [currentEmail, setCurrentEmail] = useState("");
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);

  // Initialize the form
  const form = useForm<EmailFormValues>({
    resolver: zodResolver(emailFormSchema),
    defaultValues: {
      recipient: "",
      subject: "",
      content: "",
    },
  });

  // Generate confirmation link when a pending user is detected and account confirmation template is selected
  useEffect(() => {
    if (
      session?.access_token && 
      userStatus === "pending" && 
      selectedTemplate === "accountConfirmation" &&
      currentEmail
    ) {
      setIsGeneratingLink(true);
      setLinkError(null);
      
      generateConfirmationLink(currentEmail, session.access_token)
        .then((link) => {
          setConfirmationLink(link);
          // Re-apply the template with the new link
          applyTemplate("accountConfirmation");
        })
        .catch((error) => {
          console.error("Error generating confirmation link:", error);
          setLinkError("Failed to auto-generate link. You can manually enter one instead.");
          toast.error("Failed to generate confirmation link", {
            description: "You may need to enter a link manually.",
          });
        })
        .finally(() => {
          setIsGeneratingLink(false);
        });
    }
  }, [userStatus, selectedTemplate, currentEmail, session?.access_token]);

  // Handle user status change from EmailRecipientField
  const handleUserStatusChange = (status: string | null, email: string) => {
    setUserStatus(status);
    setCurrentEmail(email);
    
    // Reset link error when email changes
    setLinkError(null);
    
    if (status !== "pending" && selectedTemplate === "accountConfirmation") {
      // Reset confirmation link if not a pending user
      setConfirmationLink("#");
    }
  };

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
    setLinkError(null);
    
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

        {/* Email Recipient Field - Now passes user status info */}
        <EmailRecipientField control={form.control} onUserStatusChange={handleUserStatusChange} />

        {/* Template Configuration */}
        {selectedTemplate !== "custom" && (
          <TemplateConfiguration
            selectedTemplate={selectedTemplate}
            recipientName={recipientName}
            confirmationLink={confirmationLink}
            onRecipientNameChange={handleRecipientNameChange}
            onConfirmationLinkChange={handleConfirmationLinkChange}
            isGeneratingLink={isGeneratingLink && selectedTemplate === "accountConfirmation"}
            isPendingUser={userStatus === "pending"}
            linkError={linkError}
          />
        )}

        {/* Form Fields */}
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
