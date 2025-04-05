
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

/**
 * Create a new user and send confirmation email
 * @param email User's email
 * @param password User's password
 * @returns Promise resolving to true if successful, false otherwise
 */
export async function createUser(email: string, password: string): Promise<boolean> {
  try {
    // Always use the production domain for redirects in deployed environments
    // or fallback to the current origin in development
    const redirectUrl = `${window.location.origin}/welcome`;
    
    console.log(`Creating user with email: ${email}, redirecting to: ${redirectUrl}`);
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          email_confirmed: false,
        }
      }
    });
    
    if (error) {
      console.error("Error creating user:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
      return false;
    }
    
    console.log("User created successfully:", data);
    toast({
      title: "Account Created",
      description: "Please check your email for a confirmation link.",
    });
    
    return true;
  } catch (err: any) {
    console.error("Unexpected error creating user:", err);
    toast({
      title: "Error",
      description: err.message || "An unexpected error occurred",
      variant: "destructive",
    });
    return false;
  }
}
