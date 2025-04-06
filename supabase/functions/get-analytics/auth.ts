
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { corsHeaders } from "./index.ts";

// Create a Supabase admin client
export function createSupabaseAdmin() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  return createClient(supabaseUrl, supabaseServiceKey);
}

// Authenticate the request and verify admin access
export async function authenticateRequest(req) {
  const supabaseAdmin = createSupabaseAdmin();
  
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    throw new Error("No authorization header");
  }

  const token = authHeader.replace("Bearer ", "");
  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

  if (authError || !user) {
    throw new Error("Unauthorized");
  }

  // Check if user is an admin
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  // Only allow access to admin users
  if (!profile || profile.role !== "dirigo_admin") {
    throw new Error("Unauthorized - Admin access required");
  }

  return supabaseAdmin;
}
