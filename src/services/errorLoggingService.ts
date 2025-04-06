
import { supabase } from "@/integrations/supabase/client";

export type ErrorType = 
  | 'auth_timeout'
  | 'auth_error'
  | 'api_error'
  | 'validation_error'
  | 'network_error'
  | 'user_action_failed'
  | 'database_error'
  | 'unknown';

export interface ErrorLogData {
  error_type: ErrorType;
  error_message: string;
  component?: string;
  user_id?: string;
  browser_info?: {
    userAgent?: string;
    platform?: string;
    language?: string;
    screenSize?: string;
  };
}

// Create the system_errors table if it doesn't exist
const createSystemErrorsTable = async () => {
  const { error } = await supabase.rpc('create_system_errors_table_if_not_exists');
  if (error) {
    console.error("Error creating system_errors table:", error);
  }
};

// Call the function to ensure the table exists
createSystemErrorsTable();

export const logError = async (errorData: ErrorLogData): Promise<void> => {
  try {
    // Get browser information
    const browserInfo = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      screenSize: `${window.innerWidth}x${window.innerHeight}`,
      ...errorData.browser_info
    };

    // Insert error into the database using a Supabase function instead of direct table access
    const { error } = await supabase.functions.invoke('log-system-error', {
      body: {
        error_type: errorData.error_type,
        error_message: errorData.error_message,
        component: errorData.component,
        user_id: errorData.user_id,
        browser_info: browserInfo
      }
    });

    if (error) {
      console.error("Failed to log error to database:", error);
    }
  } catch (err) {
    // Fallback to console if we can't log to the database
    console.error("Error logging system error:", err);
    console.error("Original error:", errorData);
  }
};

// Helper function to handle and log API errors
export const handleApiError = async (
  error: any, 
  component: string, 
  userId?: string
): Promise<void> => {
  const errorMessage = error?.message || "Unknown API error";
  const errorType: ErrorType = error?.code?.includes("timeout") 
    ? 'auth_timeout' 
    : 'api_error';
    
  await logError({
    error_type: errorType,
    error_message: errorMessage,
    component,
    user_id: userId
  });
};
