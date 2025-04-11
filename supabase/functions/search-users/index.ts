
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the Admin key
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Only allow authorized requests
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify the user is authenticated
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const { searchTerm } = await req.json();
    
    if (!searchTerm || typeof searchTerm !== "string") {
      return new Response(
        JSON.stringify({ error: "Search term is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Trim and sanitize search term
    const sanitizedTerm = searchTerm.trim().toLowerCase();
    
    if (sanitizedTerm.length < 2) {
      return new Response(
        JSON.stringify({ error: "Search term must be at least 2 characters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Searching for users with term:", sanitizedTerm);

    // Get a subset of auth users using pagination - limit to 100 for performance
    const { data: authUsers, error: usersError } = await supabaseAdmin.auth.admin.listUsers({
      perPage: 100,
      page: 1,
    });
    
    if (usersError) {
      console.error("Error listing users:", usersError);
      return new Response(
        JSON.stringify({ error: usersError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Filter users by email containing the search term
    const matchedUsers = authUsers.users
      .filter(user => user.email && user.email.toLowerCase().includes(sanitizedTerm))
      .slice(0, 5) // Limit to 5 results for best performance
      .map(user => ({
        id: user.id,
        email: user.email
      }));
    
    // Get profile data for matched users in a single batch query
    const userIds = matchedUsers.map(user => user.id);
    
    if (userIds.length === 0) {
      return new Response(
        JSON.stringify([]),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from("profiles")
      .select("id, name")
      .in("id", userIds);
      
    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
      return new Response(
        JSON.stringify({ error: profilesError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create a map for efficient lookup
    const profileMap = new Map();
    if (profiles) {
      profiles.forEach(profile => {
        profileMap.set(profile.id, profile);
      });
    }

    // Merge profile data with user data
    const usersWithProfiles = matchedUsers.map(user => {
      const profile = profileMap.get(user.id);
      return {
        id: user.id,
        email: user.email,
        name: profile?.name || null
      };
    });

    return new Response(
      JSON.stringify(usersWithProfiles),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in search-users function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Unknown error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
