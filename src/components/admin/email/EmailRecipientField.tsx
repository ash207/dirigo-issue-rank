
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Control } from "react-hook-form";
import { EmailFormValues } from "./EmailForm";
import { checkEmailExistsAdmin, lookupUserByEmail } from "@/services/auth/adminService";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle2, Clock } from "lucide-react";

interface EmailRecipientFieldProps {
  control: Control<EmailFormValues>;
  onUserStatusChange?: (status: string | null, email: string) => void;
}

const EmailRecipientField = ({ control, onUserStatusChange }: EmailRecipientFieldProps) => {
  const { session } = useAuth();
  const [isChecking, setIsChecking] = useState(false);
  const [userExists, setUserExists] = useState<boolean | null>(null);
  const [userStatus, setUserStatus] = useState<string | null>(null);
  const [email, setEmail] = useState("");

  // Check if email exists when it changes (with debounce)
  useEffect(() => {
    if (!email || email.length < 5 || !email.includes('@')) {
      setUserExists(null);
      setUserStatus(null);
      if (onUserStatusChange) onUserStatusChange(null, "");
      return;
    }
    
    const timer = setTimeout(async () => {
      if (!session?.access_token) return;
      
      setIsChecking(true);
      try {
        // First check if the email exists
        const exists = await checkEmailExistsAdmin(email, session.access_token);
        setUserExists(exists);
        
        // If it exists, look up the user status
        if (exists) {
          const userData = await lookupUserByEmail(email, session.access_token);
          const status = userData?.status || null;
          setUserStatus(status);
          if (onUserStatusChange) onUserStatusChange(status, email);
        } else {
          setUserStatus(null);
          if (onUserStatusChange) onUserStatusChange(null, email);
        }
      } catch (error) {
        console.error("Error checking email:", error);
        setUserExists(null);
        setUserStatus(null);
        if (onUserStatusChange) onUserStatusChange(null, email);
      } finally {
        setIsChecking(false);
      }
    }, 500); // Debounce for 500ms
    
    return () => clearTimeout(timer);
  }, [email, session?.access_token, onUserStatusChange]);

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
                <Alert variant="default" className={`py-2 ${userStatus === 'pending' ? 'bg-blue-50 border-blue-200' : 'bg-green-50 border-green-200'}`}>
                  {userStatus === 'pending' ? (
                    <Clock className="h-4 w-4 text-blue-500 mr-2" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                  )}
                  <AlertDescription className={`text-xs ${userStatus === 'pending' ? 'text-blue-700' : 'text-green-700'}`}>
                    {userStatus === 'pending' 
                      ? "This user has a pending account. Ideal for sending a confirmation email."
                      : "This email is registered in the system."}
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
