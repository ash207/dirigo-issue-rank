
import { AuthResponse } from "@/types/auth";
import { checkUserExists } from "@/services/auth/signup/userExistence";
import { registerNewUser } from "@/services/auth/signup/registration";

/**
 * Handles signup with automatic retry logic for timeouts
 */
export async function handleSignupWithRetry(
  email: string, 
  password: string, 
  retryCount = 0
): Promise<AuthResponse> {
  if (retryCount >= 2) {
    // If we've already retried twice, show the timeout dialog
    return { 
      data: null,
      error: { 
        code: 'max_retries', 
        message: 'Maximum retry attempts reached' 
      } 
    };
  }
  
  console.log(`Signup attempt for: ${email} with redirect to: https://dirigovotes.com/welcome${retryCount > 0 ? ` (retry ${retryCount})` : ''}`);
  
  try {
    // Check if user already exists before attempting to create (on retries)
    if (retryCount > 0) {
      const exists = await checkUserExists(email);
      if (exists) {
        console.log("User already exists, avoiding duplicate registration");
        return { 
          data: null,
          error: { 
            code: 'user_exists', 
            message: 'An account with this email already exists. Please check your email for verification instructions or try signing in.' 
          } 
        };
      }
    }
    
    const result = await registerNewUser(email, password, "https://dirigovotes.com/welcome") as AuthResponse;
    
    if (result.error) {
      console.log(`Signup error (attempt ${retryCount}):`, result.error);
      
      // If it's a timeout error, retry automatically after a delay
      const isTimeout = 
        result.error.code === 'email_timeout' || 
        result.error.message?.includes('timeout') || 
        result.error.status === 504;
        
      if (isTimeout) {
        console.log(`Retrying signup automatically (attempt ${retryCount + 1})`);
        
        // Increase delay for each retry attempt
        const delayMs = (retryCount + 1) * 2000;
        console.log(`Waiting ${delayMs}ms before retry`);
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delayMs));
        
        // Check if user was created during timeout
        const exists = await checkUserExists(email);
        if (exists) {
          console.log("User was created despite timeout, redirecting to welcome page");
          return { data: { user: { email } }, error: null };
        }
        
        // Retry with incremented count
        return handleSignupWithRetry(email, password, retryCount + 1);
      }
    }
    
    return result;
  } catch (err: any) {
    console.error(`Unexpected error during signup (attempt ${retryCount}):`, err);
    return { 
      data: null,
      error: { 
        code: 'signup_error',
        message: err.message || 'An unexpected error occurred' 
      } 
    };
  }
}
