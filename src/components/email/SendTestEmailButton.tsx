
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const SendTestEmailButton = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [isSending, setIsSending] = useState(false);

  const sendTestEmail = async () => {
    if (!user?.email) {
      toast({
        title: "Error",
        description: "Could not determine your email address.",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);

    try {
      console.log("Sending test email to:", user.email);
      
      const { data, error } = await supabase.functions.invoke("send-email", {
        body: {
          to: user.email,
          subject: "Hello from Dirigo Votes",
          htmlContent: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #0066cc;">Hello World!</h1>
              <p>This is a test email sent from Dirigo Votes.</p>
              <p>Your account email is: ${user.email}</p>
              <p>The email was sent at: ${new Date().toLocaleString()}</p>
              <hr>
              <p style="color: #666; font-size: 12px;">This is an automated message. Please do not reply to this email.</p>
            </div>
          `,
          textContent: "Hello World! This is a test email sent from Dirigo Votes."
        },
      });

      console.log("Email function response:", data);

      if (error) {
        throw error;
      }

      toast({
        title: "Email Sent",
        description: "A test email has been sent to your email address.",
      });
    } catch (error) {
      console.error("Error sending email:", error);
      toast({
        title: "Error",
        description: "Failed to send the test email. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  // Only render the button if the user is authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <Button 
      onClick={sendTestEmail} 
      disabled={isSending}
      className="bg-dirigo-blue hover:bg-dirigo-blue/90"
    >
      {isSending ? "Sending..." : "Send Test Email"}
    </Button>
  );
};

export default SendTestEmailButton;
