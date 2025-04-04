
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.36.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface PositionReportRequest {
  positionId: string;
  positionTitle: string;
  positionContent: string;
  issueId?: string;
  issueTitle?: string;
  reportReason: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { positionId, positionTitle, positionContent, issueId, issueTitle, reportReason }: PositionReportRequest = await req.json();
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
    
    // Get the user from auth context
    const { data: { user }, error: userError } = await supabase.auth.getUser(jwt);
    
    if (userError || !user) {
      console.error("Unable to get user:", userError);
      throw new Error('Unable to get user from auth token');
    }
    
    console.log("Retrieved user ID:", user.id);
    
    // Use service role key for admin operations to bypass RLS
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);
    
    // Insert the position report into the database using admin client to bypass RLS
    const { data, error } = await adminClient
      .from('position_reports')
      .insert({
        position_id: positionId,
        position_title: positionTitle,
        position_content: positionContent,
        issue_id: issueId,
        issue_title: issueTitle || "Unknown issue",
        report_reason: reportReason,
        reporter_id: user.id,
        status: 'pending'
      });
    
    if (error) {
      console.error("Error saving position report:", error);
      throw error;
    }
    
    console.log("Position report saved successfully");
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Report submitted successfully" 
      }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-position-report function:", error);
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
