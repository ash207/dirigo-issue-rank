
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

/**
 * Enum representing the different states of the signup process
 */
export enum SignupState {
  IDLE = "idle",
  CHECKING_EMAIL = "checking_email",
  CREATING_USER = "creating_user",
  SUCCESS = "success",
  ERROR = "error"
}

/**
 * Represents the result of a signup operation
 */
export interface SignupResult {
  success: boolean;
  userId?: string;
  email?: string;
  error?: string;
  state: SignupState;
}

/**
 * Checks if a user with the given email already exists
 */
export async function checkEmailExists(email: string): Promise<boolean> {
  try {
    console.log(`Checking if email exists: ${email}`);
    
    // Use signInWithPassword with a dummy password to check if the email exists
    // This is more reliable than querying the users table
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: `${Math.random().toString(36)}!Aa1`, // Random password that will never match
    });
    
    // If the error message contains "Invalid login credentials" then the email exists
    // but the password is wrong, meaning the user exists
    if (error?.message?.includes("Invalid login credentials")) {
      console.log(`Email exists: ${email}`);
      return true;
    }
    
    console.log(`Email doesn't exist: ${email}`);
    return false;
  } catch (err) {
    console.error("Error checking if email exists:", err);
    // If there's an error, we assume the email doesn't exist to be safe
    return false;
  }
}

/**
 * Creates a new user
 */
export async function createUser(
  email: string, 
  password: string
): Promise<SignupResult> {
  try {
    console.log(`Creating user: ${email}`);
    
    // Determine redirect URL based on environment
    const redirectUrl = `${window.location.origin}/welcome`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          email_confirmed: true, // Skip email confirmation
        }
      }
    });
    
    if (error) {
      console.error("Error creating user:", error);
      
      // If the error indicates the user already exists, return success
      if (error.message?.toLowerCase().includes("already") || 
          error.message?.toLowerCase().includes("exists")) {
        toast({
          title: "Account Already Exists",
          description: "An account with this email already exists. Please try signing in.",
        });
        
        return {
          success: true,
          email,
          state: SignupState.SUCCESS
        };
      }
      
      toast({
        title: "Error",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
      
      return {
        success: false,
        error: error.message || "Failed to create account",
        state: SignupState.ERROR
      };
    }
    
    console.log("User created successfully:", data);
    
    toast({
      title: "Account Created",
      description: "Your account has been created. You can now sign in.",
    });
    
    return {
      success: true,
      userId: data.user?.id,
      email,
      state: SignupState.SUCCESS
    };
  } catch (err: any) {
    console.error("Error creating user:", err);
    
    toast({
      title: "Error",
      description: err.message || "An unexpected error occurred",
      variant: "destructive",
    });
    
    return {
      success: false,
      error: err.message || "An unexpected error occurred",
      state: SignupState.ERROR
    };
  }
}

/**
 * Resends a verification email to the user
 */
export async function resendVerificationEmail(email: string): Promise<boolean> {
  try {
    const redirectUrl = `${window.location.origin}/welcome`;
    
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: redirectUrl
      }
    });
    
    if (error) {
      console.error("Error resending verification:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to resend verification email",
        variant: "destructive"
      });
      return false;
    }
    
    toast({
      title: "Verification Email Sent",
      description: "A new verification email has been sent. Please check your inbox."
    });
    
    return true;
  } catch (err: any) {
    console.error("Unexpected error resending verification:", err);
    toast({
      title: "Error",
      description: err.message || "An unexpected error occurred",
      variant: "destructive"
    });
    return false;
  }
}

/**
 * Signs in a user with email and password
 */
export async function signIn(
  email: string,
  password: string
): Promise<SignupResult> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to sign in",
        variant: "destructive",
      });
      
      return {
        success: false,
        error: error.message || "Failed to sign in",
        state: SignupState.ERROR
      };
    }
    
    toast({
      title: "Success",
      description: "You have successfully signed in",
    });
    
    return {
      success: true,
      userId: data.user?.id,
      email: data.user?.email,
      state: SignupState.SUCCESS
    };
  } catch (err: any) {
    toast({
      title: "Error",
      description: err.message || "An unexpected error occurred",
      variant: "destructive",
    });
    
    return {
      success: false,
      error: err.message || "An unexpected error occurred",
      state: SignupState.ERROR
    };
  }
}
