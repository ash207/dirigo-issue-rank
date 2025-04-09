
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
    
    if (!searchTerm) {
      return new Response(
        JSON.stringify({ error: "Search term is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Searching for users with term:", searchTerm);

    // Get all users admin data - to search by email
    const { data: authUsers, error: usersError } = await supabaseAdmin.auth.admin.listUsers({
      perPage: 100, // Limit to reasonable amount for performance
      page: 1,
    });
    
    if (usersError) {
      console.error("Error listing users:", usersError);
      return new Response(
        JSON.stringify({ error: usersError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    console.log(`Found ${authUsers.users.length} total users to search through`);
    
    // Optimize filtering with lowercase comparison
    const lowerSearchTerm = searchTerm.toLowerCase();
    const filteredUsers = authUsers.users
      .filter(user => {
        if (!user.email) return false;
        return user.email.toLowerCase().includes(lowerSearchTerm);
      })
      .slice(0, 5)  // Limit to 5 results
      .map(user => ({
        id: user.id,
        email: user.email
      }));
    
    console.log(`Found ${filteredUsers.length} users matching "${searchTerm}"`);

    // Only query profiles if we have matching users
    if (filteredUsers.length === 0) {
      return new Response(
        JSON.stringify([]),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Get profile data for the filtered users
    const userIds = filteredUsers.map(user => user.id);
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from("profiles")
      .select("id, name")
      .in("id", userIds);
      
    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
    }

    console.log(`Retrieved ${profiles?.length || 0} profile records`);

    // Create a map for efficient lookup
    const profileMap = new Map();
    if (profiles) {
      profiles.forEach(profile => {
        profileMap.set(profile.id, profile);
      });
    }

    // Merge profile data with users
    const usersWithProfiles = filteredUsers.map(user => {
      const profile = profileMap.get(user.id);
      return {
        id: user.id,
        email: user.email, // Include the email
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
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
