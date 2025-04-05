
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { sendAdminEmail } from "@/services/auth/adminService";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import EmailForm, { EmailFormValues } from "./email/EmailForm";

const AdminEmailSender = () => {
  const { session } = useAuth();
  const [isSending, setIsSending] = useState(false);

  // Handle form submission
  const handleSubmit = async (data: EmailFormValues) => {
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
      
      <CardContent>
        <EmailForm 
          onSubmit={handleSubmit}
          isSending={isSending}
        />
      </CardContent>
    </Card>
  );
};

export default AdminEmailSender;
