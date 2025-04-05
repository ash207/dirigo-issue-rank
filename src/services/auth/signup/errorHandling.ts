
import { AuthResponse } from "@/types/auth";

/**
 * Process common auth errors and return standardized response
 * 
 * @param error The original error object
 * @returns A standardized AuthResponse with error details
 */
export function processAuthError(err: any): AuthResponse {
  console.error("Auth error:", err);
  
  // Check if this is a timeout or network related error
  if (
    err.message?.includes("timeout") || 
    err.message?.includes("Network") ||
    err.message?.includes("fetch") ||
    err.code === 'email_timeout' ||
    (err as any)?.status === 504
  ) {
    return {
      data: null,
      error: {
        name: "AuthRetryableFetchError",
        code: 'email_timeout',
        message: 'Email verification timed out. Your account may have been created, but the verification email could not be sent.'
      }
    };
  }
  
  return {
    data: null,
    error: {
      code: 'signup_error',
      message: err.message || 'An unexpected error occurred during signup'
    }
  };
}

/**
 * Process auth responses and standardize error handling
 * 
 * @param response The original auth response
 * @returns A standardized AuthResponse
 */
export function processAuthResponse(response: any): AuthResponse {
  if (response.error) {
    console.error("Registration error:", response.error);
    
    // Handle user already exists error
    if (response.error.message?.includes("already") || 
        response.error.message?.includes("exists") ||
        response.error.status === 400) {
      return {
        data: null,
        error: {
          code: 'user_exists',
          message: 'An account with this email already exists. Please try signing in or reset your password.'
        }
      };
    }
    
    // Return custom error for timeouts or network issues
    if (
      response.error.message?.includes("timeout") || 
      response.error.message?.includes("deadline exceeded") ||
      response.error.message?.includes("fetch") ||
      response.error.message?.includes("network") ||
      response.error.status === 504
    ) {
      return {
        data: null,
        error: {
          code: 'email_timeout',
          message: 'Email verification timed out. Your account may have been created, but the verification email could not be sent.'
        }
      };
    }
  } else {
    console.log("Registration successful, user ID:", response.data?.user?.id);
  }
  
  return response;
}
