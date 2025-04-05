
import { useState, useEffect } from "react";
import { checkUserExists } from "@/services/newSignupService";
import { toast } from "@/hooks/use-toast";

export function useExistingUserCheck(showTimeoutDialog: boolean, email: string) {
  const [isCheckingExistingUser, setIsCheckingExistingUser] = useState(false);

  // This effect checks if a user account was created despite timeout
  useEffect(() => {
    if (showTimeoutDialog && email && !isCheckingExistingUser) {
      setIsCheckingExistingUser(true);
      
      // Add a delay before checking to allow Supabase to complete the operation
      const timer = setTimeout(async () => {
        try {
          const exists = await checkUserExists(email);
          
          if (exists) {
            console.log("User account exists despite timeout error");
            toast({
              title: "Account may exist",
              description: "We detected that your account might have been created. Please check your email or try signing in.",
            });
          }
        } catch (err) {
          console.error("Error checking if user exists:", err);
        } finally {
          setIsCheckingExistingUser(false);
        }
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [showTimeoutDialog, email]);

  return { isCheckingExistingUser };
}
