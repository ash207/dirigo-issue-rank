
import { supabase } from "@/integrations/supabase/client";
import { wait } from "@/services/utils/timing";

// Enhanced sign-up function with better error handling and retry logic
export async function signUp(
  email: string, 
  password: string, 
  redirectUrl: string,
  onSuccess: (userData: any) => void, 
  onError: (error: any) => void
) {
  try {
    console.log("Starting signup process for:", email);
    
    // Try the signup process with a longer timeout
    const maxRetries = 2;
    let currentRetry = 0;
    let lastError = null;
    
    while (currentRetry <= maxRetries) {
      try {
        // Increased timeout between retries
        if (currentRetry > 0) {
          console.log(`Retry attempt ${currentRetry}/${maxRetries}`);
          await wait(1000 * currentRetry); // Wait longer for each retry
        }
        
        // Set a client-side timeout to catch supabase timeouts
        const signUpPromise = supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              signup_attempt: new Date().toISOString(),
              retry_count: currentRetry
            }
          }
        });
        
        // Create a timeout promise
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error("Client timeout after 15 seconds")), 15000);
        });
        
        // Race the signup against the timeout
        const { data, error } = await Promise.race([
          signUpPromise,
          timeoutPromise.then(() => {
            throw new Error("Request timed out. Please try again.");
          })
        ]) as any;
        
        if (error) throw error;
        
        // If we reach here, the signup was successful
        console.log("Signup successful:", data?.user?.id);
        
        // Add a delay to ensure Supabase completes background operations
        await wait(1000);
        
        onSuccess(data);
        return; // Exit the function on success
        
      } catch (error: any) {
        console.error(`Signup attempt ${currentRetry + 1} failed:`, error);
        lastError = error;
        
        // Only retry on timeout or network errors
        if (error.status === 504 || 
            error.message?.includes("timeout") || 
            error.message?.includes("network") ||
            error.message?.includes("fetch")) {
          currentRetry++;
        } else {
          // For other errors (like user already exists), don't retry
          break;
        }
      }
    }
    
    // If we get here, all retries failed or non-retriable error
    throw lastError || new Error("Failed to create account after multiple attempts");
    
  } catch (error: any) {
    console.error("All signup attempts failed:", error);
    
    // Provide helpful error messages based on error type
    let errorMessage = "Failed to create account";
    
    if (error.code === "over_email_send_rate_limit") {
      errorMessage = "Too many sign-up attempts. Please try again later.";
    } else if (error.status === 504 || error.code === "23505" || 
              error.message?.includes("timeout") || error.message?.includes("gateway") || 
              error.message?.includes("network")) {
      errorMessage = "The server is experiencing high traffic. Your account may have been created. Please check your email or try signing in with the credentials you just used.";
    } else if (error.message?.includes("already") || error.message?.includes("exists")) {
      errorMessage = "An account with this email already exists. Please try signing in.";
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    onError({ ...error, message: errorMessage });
    throw error;
  }
}
