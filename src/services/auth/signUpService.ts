
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
        
        console.log(`Attempt ${currentRetry + 1}: Initiating signup request to Supabase`);
        
        // Use a Promise.race to implement client-side timeout
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
          setTimeout(() => {
            console.log(`Attempt ${currentRetry + 1}: Client timeout after 30 seconds`);
            reject(new Error("Client timeout after 30 seconds"));
          }, 30000);
        });
        
        // Race the signup against the timeout
        const result = await Promise.race([
          signUpPromise,
          timeoutPromise.then(() => {
            throw new Error("Request timed out. Please try again.");
          })
        ]);
        
        // Properly handle the response
        const { data, error } = result as any;
        
        if (error) {
          console.error(`Attempt ${currentRetry + 1}: Supabase returned an error:`, error);
          throw error;
        }
        
        console.log(`Attempt ${currentRetry + 1}: Signup successful! User data:`, data);
        
        // Ensure we have session data - this is critical!
        if (!data?.user) {
          console.warn(`Attempt ${currentRetry + 1}: Signup successful but no user data returned`);
        }
        
        // Add a delay to ensure Supabase completes background operations
        await wait(1000);
        
        onSuccess(data);
        return; // Exit the function on success
        
      } catch (error: any) {
        console.error(`Signup attempt ${currentRetry + 1} failed:`, error);
        
        // Detailed logging for troubleshooting
        if (error.code || error.status || error.message) {
          console.log(`Error details - Code: ${error.code || 'undefined'}, Status: ${error.status || 'undefined'}, Message: ${error.message || 'undefined'}`);
        } else {
          console.log("Error object doesn't contain standard error properties:", error);
        }
        
        lastError = error;
        
        // Only retry on timeout or network errors
        if (error.status === 504 || 
            error.message?.includes("timeout") || 
            error.message?.includes("network") ||
            error.message?.includes("fetch")) {
          console.log(`Error is retriable, will attempt retry ${currentRetry + 1}/${maxRetries}`);
          currentRetry++;
          
          // If this was the last retry attempt and it failed with a timeout,
          // we'll still try to check if the account was created
          if (currentRetry > maxRetries && error.message?.includes("timeout")) {
            console.log("Maximum retries reached with timeout. Account may have been created despite timeout.");
            // Return a special error that indicates potential account creation
            onError({
              ...error,
              code: "potential_success_with_timeout",
              message: "Your account may have been created despite the timeout. Please check your email or try signing in."
            });
            return;
          }
        } else {
          // For other errors (like user already exists), don't retry
          console.log("Error is not retriable, ending retry loop.");
          break;
        }
      }
    }
    
    // If we get here, all retries failed or non-retriable error
    console.error("All signup attempts failed:", lastError);
    throw lastError || new Error("Failed to create account after multiple attempts");
    
  } catch (error: any) {
    console.error("Final signup error:", error);
    
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
    
    console.log("Returning user-friendly error:", errorMessage);
    onError({ ...error, message: errorMessage });
  }
}
