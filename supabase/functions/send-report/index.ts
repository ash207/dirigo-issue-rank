
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ReportRequest {
  issueId: string;
  issueTitle: string;
  reportReason: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { issueId, issueTitle, reportReason }: ReportRequest = await req.json();

    // Check if API key exists
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("RESEND_API_KEY is not configured");
      // For development purposes, log the report but return success
      console.log("Report that would be sent:", {
        issueId,
        issueTitle,
        reportReason
      });
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Report logged (Resend API key not configured)" 
        }), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }

    const resend = new Resend(resendApiKey);
    const emailResponse = await resend.emails.send({
      from: "Issue Reports <onboarding@resend.dev>",
      to: ["anthonyshaeuser@gmail.com"],
      subject: `Issue Report: ${issueTitle}`,
      html: `
        <h1>Issue Report</h1>
        <p><strong>Issue ID:</strong> ${issueId}</p>
        <p><strong>Issue Title:</strong> ${issueTitle}</p>
        <h2>Report Reason:</h2>
        <p>${reportReason}</p>
      `,
    });

    console.log("Report email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-report function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
