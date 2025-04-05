
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { emailTemplates } from "@/services/auth/adminService";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import EmailTemplateSelector, { SelectedTemplateType } from "./EmailTemplateSelector";
import TemplateConfiguration from "./TemplateConfiguration";
import EmailPreview from "./EmailPreview";

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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Template Selector */}
        <div className="space-y-2">
          <FormLabel>Email Template</FormLabel>
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

        {/* Recipient Email Field */}
        <FormField
          control={form.control}
          name="recipient"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Recipient Email</FormLabel>
              <FormControl>
                <Input placeholder="user@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Subject Field */}
        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subject</FormLabel>
              <FormControl>
                <Input placeholder="Email subject" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Email Content Field */}
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Content (HTML)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="<p>Enter your email content here...</p>" 
                  className="min-h-[200px] font-mono text-sm"
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                You can use HTML tags to format your email.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Email Preview */}
        <EmailPreview
          open={openPreview}
          onOpenChange={setOpenPreview}
          recipient={form.getValues("recipient")}
          subject={form.getValues("subject")}
          content={form.getValues("content")}
        />
        
        {/* Form Actions */}
        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => form.reset()}
          >
            Reset
          </Button>
          <Button 
            type="submit" 
            disabled={isSending}
            className="bg-dirigo-blue hover:bg-dirigo-blue/90"
          >
            {isSending ? "Sending..." : "Send Email"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default EmailForm;
