
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.36.0";
import { Resend } from "npm:resend@2.0.0";

// Initialize Resend with primary API key
const primaryApiKey = Deno.env.get("RESEND_API_KEY");
const fallbackApiKey = Deno.env.get("RESEND_API_KEY_2");

if (!primaryApiKey) {
  console.error("RESEND_API_KEY is not set in environment variables");
}

if (!fallbackApiKey) {
  console.error("RESEND_API_KEY_2 is not set in environment variables");
}

// Check if API keys are identical
if (primaryApiKey && fallbackApiKey && primaryApiKey === fallbackApiKey) {
  console.warn("WARNING: Primary and fallback API keys are identical. This will not provide true redundancy.");
}

// Create primary Resend instance
const resend = new Resend(primaryApiKey);
// Create fallback Resend instance
const fallbackResend = new Resend(fallbackApiKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  replyTo?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Received email request");
    const { to, subject, htmlContent, textContent, replyTo }: EmailRequest = await req.json();
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader) {
      throw new Error('Missing Authorization header');
    }
    
    // Create a Supabase client with the auth header from the request
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Extract user ID from auth JWT
    const jwt = authHeader.replace('Bearer ', '');
    
    // Get the user from auth context to verify they're authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser(jwt);
    
    if (userError || !user) {
      console.error("Unable to get user:", userError);
      throw new Error('Unable to get user from auth token');
    }
    
    console.log("Authenticated user:", user.id);
    console.log("Sending email to:", to);
    console.log("Email subject:", subject);
    
    // Prepare email options
    const emailOptions: any = {
      from: "Dirigo Votes <no-reply@contact.dirigovotes.com>",
      to: [to],
      subject: subject,
      html: htmlContent,
      text: textContent || ""
    };

    // Add reply-to if provided
    if (replyTo) {
      emailOptions.reply_to = replyTo;
      console.log("Using reply-to:", replyTo);
    }

    console.log("Sending email with options:", JSON.stringify({
      from: emailOptions.from,
      to: emailOptions.to,
      subject: emailOptions.subject
    }));
    
    // Validate primary API key format
    if (!primaryApiKey?.startsWith('re_')) {
      console.error("Primary API key appears to be invalid. Should start with 're_'");
    } else {
      console.log("Primary API key format appears valid (starts with 're_')");
    }
    
    console.log("Trying primary API key (first 5 chars):", primaryApiKey?.substring(0, 5) + "...");
    
    try {
      // Try with primary API key first
      const emailResponse = await resend.emails.send(emailOptions);
      console.log("Email sent successfully with primary API key:", JSON.stringify(emailResponse));
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Email sent successfully",
          data: emailResponse
        }), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    } catch (primaryError: any) {
      // If primary key fails, log the error and try with fallback
      console.error("Error with primary API key:", primaryError.message);
      console.error("Full primary error:", JSON.stringify(primaryError));
      
      // Validate fallback API key format
      if (!fallbackApiKey?.startsWith('re_')) {
        console.error("Fallback API key appears to be invalid. Should start with 're_'");
      } else {
        console.log("Fallback API key format appears valid (starts with 're_')");
      }
      
      console.log("Trying fallback API key (first 5 chars):", fallbackApiKey?.substring(0, 5) + "...");
      
      try {
        // Try with fallback API key
        const fallbackResponse = await fallbackResend.emails.send(emailOptions);
        console.log("Email sent successfully with fallback API key:", JSON.stringify(fallbackResponse));
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: "Email sent successfully with fallback API key",
            data: fallbackResponse
          }), {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders,
            },
          }
        );
      } catch (fallbackError: any) {
        // Both API keys failed
        console.error("Error with fallback API key:", fallbackError.message);
        console.error("Full fallback error:", JSON.stringify(fallbackError));
        throw new Error(`Failed with both API keys. Primary error: ${primaryError.message}. Fallback error: ${fallbackError.message}`);
      }
    }
  } catch (error: any) {
    console.error("Error in send-email function:", error);
    console.error("Error details:", error.message);
    
    // More detailed error information
    if (error.response) {
      console.error("Resend API error response:", JSON.stringify(error.response));
    }
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.response || "No additional details available"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
