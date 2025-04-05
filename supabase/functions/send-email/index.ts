
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.36.0";
import { Resend } from "npm:resend@2.0.0";

// Initialize Resend with your API key
const resendApiKey = Deno.env.get("RESEND_API_KEY");
if (!resendApiKey) {
  console.error("RESEND_API_KEY is not set in environment variables");
}
const resend = new Resend(resendApiKey);

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
    
    console.log("Using Supabase URL:", supabaseUrl);
    console.log("Authorization header present:", !!authHeader);
    
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
    
    // Construct email options
    const emailOptions: any = {
      from: "Dirigo Votes <noreply@dirigovotes.com>",
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

    console.log("Sending email with Resend using options:", JSON.stringify({
      from: emailOptions.from,
      to: emailOptions.to,
      subject: emailOptions.subject
    }));
    
    // Send the email with Resend
    const emailResponse = await resend.emails.send(emailOptions);

    console.log("Email sent successfully:", JSON.stringify(emailResponse));
    
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
