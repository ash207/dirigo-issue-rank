
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Control } from "react-hook-form";
import { EmailFormValues } from "./EmailForm";
import { checkEmailExistsAdmin } from "@/services/auth/adminService";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

interface EmailRecipientFieldProps {
  control: Control<EmailFormValues>;
}

const EmailRecipientField = ({ control }: EmailRecipientFieldProps) => {
  const { session } = useAuth();
  const [isChecking, setIsChecking] = useState(false);
  const [userExists, setUserExists] = useState<boolean | null>(null);
  const [email, setEmail] = useState("");

  // Check if email exists when it changes (with debounce)
  useEffect(() => {
    if (!email || email.length < 5 || !email.includes('@')) return;
    
    const timer = setTimeout(async () => {
      if (!session?.access_token) return;
      
      setIsChecking(true);
      try {
        const exists = await checkEmailExistsAdmin(email, session.access_token);
        setUserExists(exists);
      } catch (error) {
        console.error("Error checking email:", error);
        setUserExists(null);
      } finally {
        setIsChecking(false);
      }
    }, 500); // Debounce for 500ms
    
    return () => clearTimeout(timer);
  }, [email, session?.access_token]);

  return (
    <FormField
      control={control}
      name="recipient"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Recipient Email</FormLabel>
          <FormControl>
            <Input 
              placeholder="user@example.com" 
              {...field} 
              onChange={(e) => {
                field.onChange(e);
                setEmail(e.target.value);
              }}
            />
          </FormControl>
          
          {/* Email existence indicator */}
          {email && email.includes('@') && !isChecking && userExists !== null && (
            <div className="mt-2">
              {userExists ? (
                <Alert variant="default" className="bg-green-50 border-green-200 py-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                  <AlertDescription className="text-green-700 text-xs">
                    This email is registered in the system.
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert variant="default" className="bg-amber-50 border-amber-200 py-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500 mr-2" />
                  <AlertDescription className="text-amber-700 text-xs">
                    Warning: This email is not registered in the system. The recipient may not receive the email.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
          
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default EmailRecipientField;
