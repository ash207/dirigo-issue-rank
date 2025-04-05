
import { supabase } from "@/integrations/supabase/client";

/**
 * Check if an email exists in the system using the dedicated edge function
 * @param email The email to check
 * @param token JWT token for authentication
 * @returns Promise resolving to true if the email exists, false otherwise
 */
export async function checkEmailExistsAdmin(email: string, token: string): Promise<boolean> {
  try {
    if (!email || !token) return false;
    
    const { data, error } = await supabase.functions.invoke("check-email-exists", {
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: { email }
    });
    
    if (error) throw error;
    
    return data?.exists || false;
  } catch (err) {
    console.error("Error checking if email exists:", err);
    return false;
  }
}

/**
 * Look up detailed user information by email
 * @param email The email to look up
 * @param token JWT token for authentication
 * @returns Promise resolving to the user information if found
 */
export async function lookupUserByEmail(email: string, token: string) {
  try {
    if (!email || !token) {
      throw new Error("Email and authentication token are required");
    }
    
    const { data, error } = await supabase.functions.invoke("lookup-user", {
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: { email }
    });
    
    if (error) throw error;
    
    return data;
  } catch (err) {
    console.error("Error looking up user:", err);
    throw err;
  }
}

/**
 * Generate a confirmation link for a pending user
 * @param email The user's email address
 * @param token JWT token for authentication
 * @returns Promise resolving to the confirmation link
 */
export async function generateConfirmationLink(email: string, token: string): Promise<string> {
  try {
    if (!email || !token) {
      throw new Error("Email and authentication token are required");
    }
    
    // First, look up the user to confirm they exist and are pending
    const userData = await lookupUserByEmail(email, token);
    
    if (!userData || !userData.exists) {
      throw new Error("User not found");
    }
    
    if (userData.status !== "pending" && !userData.emailConfirmed) {
      throw new Error("User is not in pending status");
    }
    
    // Create a secure token (in a production app, this would be a JWT with proper validation)
    const timestamp = Date.now();
    const userId = userData.id;
    const tokenData = `${userId}_${timestamp}`;
    const encodedToken = btoa(tokenData);
    
    // Generate a confirmation link with the token using the current origin
    // This ensures it works in both development and production environments
    const host = window.location.origin || "https://dirigovotes.com";
    const confirmationLink = `${host}/welcome?token=${encodedToken}&email=${encodeURIComponent(email)}`;
    
    console.log("Generated confirmation link:", confirmationLink);
    
    return confirmationLink;
  } catch (err) {
    console.error("Error generating confirmation link:", err);
    throw err;
  }
}

/**
 * Send a custom email to a user
 * @param to Recipient email address
 * @param subject Email subject
 * @param htmlContent HTML content of the email
 * @param textContent Plain text content of the email (optional)
 * @param token JWT token for authentication
 * @returns Promise resolving to the result of the send operation
 */
export async function sendAdminEmail(
  to: string, 
  subject: string, 
  htmlContent: string, 
  textContent?: string,
  token?: string
) {
  try {
    const { data, error } = await supabase.functions.invoke("send-email", {
      headers: token ? {
        Authorization: `Bearer ${token}`
      } : undefined,
      body: {
        to,
        subject,
        htmlContent,
        textContent: textContent || htmlContent.replace(/<[^>]*>/g, '')
      }
    });
    
    if (error) throw error;
    
    return data;
  } catch (err) {
    console.error("Error sending admin email:", err);
    throw err;
  }
}

// Email templates
export const emailTemplates = {
  welcome: {
    subject: "Welcome to Dirigo Votes",
    getHtml: (name: string = "there") => `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #0066cc;">Welcome to Dirigo Votes!</h1>
        <p>Hello ${name},</p>
        <p>Thank you for joining Dirigo Votes. We're excited to have you on board!</p>
        <p>With your account, you can now:</p>
        <ul>
          <li>Create and vote on important issues</li>
          <li>Share your position on topics that matter</li>
          <li>Connect with others in your community</li>
        </ul>
        <p>If you have any questions or need assistance, please don't hesitate to contact us.</p>
        <hr>
        <p style="color: #666; font-size: 12px;">This email was sent from Dirigo Votes.</p>
      </div>
    `
  },
  accountConfirmation: {
    subject: "Please Confirm Your Dirigo Votes Account",
    getHtml: (name: string = "there", confirmationLink: string = "#") => `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #0066cc;">Confirm Your Account</h1>
        <p>Hello ${name},</p>
        <p>Please confirm your email address to activate your Dirigo Votes account.</p>
        <p>
          <a href="${confirmationLink}" style="display: inline-block; padding: 12px 20px; background-color: #0066cc; color: white; text-decoration: none; border-radius: 4px; font-weight: bold;">
            Confirm Email Address
          </a>
        </p>
        <p>If you didn't create an account with us, you can safely ignore this email.</p>
        <hr>
        <p style="color: #666; font-size: 12px;">This email was sent from Dirigo Votes.</p>
      </div>
    `
  },
  passwordReset: {
    subject: "Reset Your Dirigo Votes Password",
    getHtml: (name: string = "there", resetLink: string = "#") => `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #0066cc;">Reset Your Password</h1>
        <p>Hello ${name},</p>
        <p>We received a request to reset your Dirigo Votes password.</p>
        <p>
          <a href="${resetLink}" style="display: inline-block; padding: 12px 20px; background-color: #0066cc; color: white; text-decoration: none; border-radius: 4px; font-weight: bold;">
            Reset Password
          </a>
        </p>
        <p>If you didn't request a password reset, you can safely ignore this email.</p>
        <hr>
        <p style="color: #666; font-size: 12px;">This email was sent from Dirigo Votes.</p>
      </div>
    `
  }
};
