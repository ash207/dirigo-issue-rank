
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { sendAdminEmail, emailTemplates } from "@/services/auth/adminService";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

// Template options, matching the keys in emailTemplates
type TemplateKey = keyof typeof emailTemplates;
const templateOptions: TemplateKey[] = Object.keys(emailTemplates) as TemplateKey[];

// Define a type that includes both TemplateKey and "custom"
type SelectedTemplateType = TemplateKey | "custom";

// Form schema for email sending
const emailFormSchema = z.object({
  recipient: z.string().email("Please enter a valid email address"),
  subject: z.string().min(1, "Subject is required"),
  content: z.string().min(1, "Email content is required"),
});

type EmailFormValues = z.infer<typeof emailFormSchema>;

const AdminEmailSender = () => {
  const { session } = useAuth();
  const [isSending, setIsSending] = useState(false);
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
  const applyTemplate = (template: TemplateKey) => {
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
  const handleTemplateChange = (value: string) => {
    if (value === "custom") {
      setSelectedTemplate("custom");
      form.setValue("subject", "");
      form.setValue("content", "");
    } else if (templateOptions.includes(value as TemplateKey)) {
      setSelectedTemplate(value as TemplateKey);
      applyTemplate(value as TemplateKey);
    }
  };

  // Handle form submission
  const onSubmit = async (data: EmailFormValues) => {
    if (!session?.access_token) {
      toast("Please sign in to send emails");
      return;
    }

    setIsSending(true);
    try {
      await sendAdminEmail(
        data.recipient,
        data.subject,
        data.content,
        undefined,
        session.access_token
      );
      
      toast("Email sent successfully!");
      form.reset();
      setSelectedTemplate("custom");
    } catch (error) {
      console.error("Error sending email:", error);
      toast("Failed to send email. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Send Admin Email</CardTitle>
        <CardDescription>
          Send custom emails or use templates to communicate with users
        </CardDescription>
      </CardHeader>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {/* Template Selector */}
            <div className="space-y-2">
              <FormLabel>Email Template</FormLabel>
              <Select
                value={selectedTemplate}
                onValueChange={handleTemplateChange}
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

            {/* Template Configuration */}
            {selectedTemplate !== "custom" && (
              <div className="space-y-4 border p-4 rounded-md bg-slate-50">
                <h3 className="font-medium">Template Configuration</h3>
                
                <div className="space-y-2">
                  <FormLabel>Recipient Name</FormLabel>
                  <Input
                    placeholder="Recipient's name"
                    value={recipientName}
                    onChange={(e) => {
                      setRecipientName(e.target.value);
                      // Re-apply template with new name
                      if (selectedTemplate !== "custom") {
                        applyTemplate(selectedTemplate);
                      }
                    }}
                  />
                </div>
                
                {(selectedTemplate === "accountConfirmation" || selectedTemplate === "passwordReset") && (
                  <div className="space-y-2">
                    <FormLabel>Confirmation/Reset Link</FormLabel>
                    <Input
                      placeholder="https://example.com/confirm?token=..."
                      value={confirmationLink}
                      onChange={(e) => {
                        setConfirmationLink(e.target.value);
                        // Re-apply template with new link
                        if (selectedTemplate !== "custom") {
                          applyTemplate(selectedTemplate);
                        }
                      }}
                    />
                  </div>
                )}
              </div>
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
            
            {/* Preview Dialog */}
            <Dialog open={openPreview} onOpenChange={setOpenPreview}>
              <DialogTrigger asChild>
                <Button type="button" variant="outline">Preview Email</Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[80vh] overflow-auto">
                <DialogHeader>
                  <DialogTitle>Email Preview</DialogTitle>
                </DialogHeader>
                <div className="border rounded-md p-4 mt-4">
                  <div className="mb-4">
                    <strong>To:</strong> {form.getValues("recipient")}<br />
                    <strong>Subject:</strong> {form.getValues("subject")}
                  </div>
                  <div 
                    className="border-t pt-4"
                    dangerouslySetInnerHTML={{ __html: form.getValues("content") }} 
                  />
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
          
          <CardFooter className="flex justify-between">
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
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default AdminEmailSender;
