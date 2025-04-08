
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.24.0";

// Required CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Create Supabase client with service role (has admin privileges)
const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // Parse request body
    const { positionId, issueId, userId } = await req.json();

    if (!positionId) {
      return new Response(JSON.stringify({ error: "Position ID is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Two operations:
    // 1. Increment the anonymous vote count
    // 2. If user is authenticated, track participation (but not which position they voted for)

    // Operation 1: Increment anonymous vote count
    const { error: incrementError } = await supabaseAdmin.rpc(
      'increment_anonymous_vote',
      { p_position_id: positionId }
    );
    
    if (incrementError) {
      console.error("Error incrementing anonymous vote:", incrementError);
      return new Response(JSON.stringify({ error: "Failed to record anonymous vote" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Operation 2: If user is authenticated and issueId is provided, track participation
    // We only track that they participated in this issue, not which position they voted for
    if (userId && issueId) {
      // Insert participation record using direct SQL query to avoid TypeScript errors with missing table
      const { error: participationError } = await supabaseAdmin
        .from('user_issue_participation')
        .upsert([
          { 
            user_id: userId, 
            issue_id: issueId,
            participated_at: new Date().toISOString()
          }
        ], { 
          onConflict: 'user_id,issue_id',
          ignoreDuplicates: true
        });
      
      if (participationError) {
        console.error("Error tracking participation:", participationError);
        // We don't fail the request if participation tracking fails
        // The vote was still recorded anonymously
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error processing ghost vote:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
