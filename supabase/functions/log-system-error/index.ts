
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

// CORS headers for all responses
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Create a Supabase client with the service role key
function createSupabaseClient() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase URL or service key");
  }
  
  return createClient(supabaseUrl, supabaseServiceKey);
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  
  try {
    const supabase = createSupabaseClient();
    
    // Ensure the system_errors table exists
    await createSystemErrorsTableIfNotExists(supabase);
    
    // Parse the request body
    const body = await req.json();
    
    // Check the auth token in the request and get the user
    const authHeader = req.headers.get("Authorization");
    
    // Can be anonymous or authenticated
    let userId = body.user_id;
    
    if (authHeader && !userId) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id;
    }
    
    // Insert error into the database
    const { error } = await supabase.from("system_errors").insert({
      error_type: body.error_type,
      error_message: body.error_message,
      component: body.component,
      user_id: userId,
      browser_info: body.browser_info
    });
    
    if (error) {
      console.error("Failed to log error to database:", error);
      return new Response(
        JSON.stringify({ error: "Failed to log error to database" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Error in log-system-error function:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Function to create the system_errors table if it doesn't exist
async function createSystemErrorsTableIfNotExists(supabase) {
  try {
    // Check if the system_errors table exists
    const { error: checkError } = await supabase
      .from("system_errors")
      .select("id")
      .limit(1);
    
    // If we got an error that's not a 404, the table might not exist
    if (checkError && checkError.code === "PGRST116") {
      // Create the system_errors table
      const { error } = await supabase.rpc("create_system_errors_table");
      
      if (error) {
        console.error("Error creating system_errors table:", error);
      }
    }
  } catch (err) {
    console.error("Error checking system_errors table:", err);
  }
}
