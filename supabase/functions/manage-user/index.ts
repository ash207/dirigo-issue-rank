
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Handle CORS preflight requests
const handleCors = (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  return null;
};

// Verify admin permissions
const verifyAdminPermissions = async (supabase: any, token: string) => {
  try {
    // Verify the token and get the user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    // Check if the user has admin permissions
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError) {
      throw new Error("Error fetching user profile");
    }

    // Verify the user is an admin
    if (profile.role !== "dirigo_admin" && profile.role !== "politician_admin" && profile.role !== "moderator") {
      throw new Error("Insufficient permissions");
    }

    return user;
  } catch (err) {
    console.error("Error verifying admin permissions:", err);
    throw err;
  }
};

serve(async (req) => {
  // Handle CORS
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // Initialize Supabase client with admin privileges
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Get authorization token
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }
    const token = authHeader.replace("Bearer ", "");

    // Verify admin permissions
    const adminUser = await verifyAdminPermissions(supabaseAdmin, token);

    // Parse request body
    const { userId, action, value, email } = await req.json();

    if (!userId || !action) {
      throw new Error("Missing required parameters: userId and action");
    }

    let result;

    // Handle different actions
    switch (action) {
      case "updateRole":
        if (!value) {
          throw new Error("Missing role value");
        }
        
        // Update user role
        const { data: roleData, error: roleError } = await supabaseAdmin
          .from("profiles")
          .update({ role: value })
          .eq("id", userId)
          .select("*");

        if (roleError) {
          throw roleError;
        }

        result = { success: true, message: "User role updated", user: roleData[0] };
        break;

      case "updateStatus":
        if (!value) {
          throw new Error("Missing status value");
        }
        
        // Update user status
        const { data: statusData, error: statusError } = await supabaseAdmin
          .from("profiles")
          .update({ status: value })
          .eq("id", userId)
          .select("*");

        if (statusError) {
          throw statusError;
        }

        result = { success: true, message: "User status updated", user: statusData[0] };
        break;

      case "confirmEmail":
        // This is a special admin action to confirm a user's email
        console.log("Confirming email for user:", userId);
        
        try {
          // First try to get the user email if not provided
          let userEmail = email;
          if (!userEmail) {
            const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);
            if (userError) throw userError;
            userEmail = userData.user.email;
          }
          
          if (!userEmail) {
            throw new Error("Could not determine user email");
          }
          
          console.log("Confirming email for:", userEmail);
          
          // 1. Update the auth.users table to set email_confirmed_at timestamp
          const now = new Date().toISOString();
          // Use email_verified: true in both user_metadata and identity_data
          const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
            userId,
            { 
              email_confirmed_at: now,
              user_metadata: { 
                email_confirmed: true, 
                email_verified: true  // Add this field
              },
              app_metadata: {
                email_verified: true  // Add this field
              }
            }
          );
          
          if (updateError) throw updateError;
          
          console.log("Updated auth user confirmation status:", updateData);
          
          // Also update the user's identity data to mark email as verified
          try {
            // Get the user's identities
            const { data: identityData, error: identityError } = await supabaseAdmin
              .from("identities")
              .select("id, identity_data")
              .eq("user_id", userId);
            
            if (identityError) throw identityError;
            
            if (identityData && identityData.length > 0) {
              // Update each identity to mark email as verified
              for (const identity of identityData) {
                const updatedIdentityData = {
                  ...identity.identity_data,
                  email_verified: true
                };
                
                await supabaseAdmin
                  .from("identities")
                  .update({ identity_data: updatedIdentityData })
                  .eq("id", identity.id);
              }
              console.log("Updated identity data to mark email as verified");
            }
          } catch (identityUpdateError) {
            console.error("Error updating identity data:", identityUpdateError);
            // Continue with other operations even if this fails
          }
          
          // 2. Also update the profile status to active if it's pending
          const { data: profileData, error: profileError } = await supabaseAdmin
            .from("profiles")
            .update({ status: "active" })
            .eq("id", userId)
            .select("*");
            
          if (profileError) {
            console.error("Error updating profile status:", profileError);
          } else {
            console.log("Updated profile status:", profileData);
          }
          
          const adminMessage = `User email confirmed and status updated to active`;
          
          // Send admin confirmation
          result = { 
            success: true, 
            message: adminMessage, 
            user: updateData.user,
            profile: profileError ? null : profileData[0]
          };
        } catch (confirmError: any) {
          console.error("Error confirming email:", confirmError);
          throw new Error(`Failed to confirm email: ${confirmError.message}`);
        }
        break;
        
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("Error in manage-user function:", err);
    
    return new Response(
      JSON.stringify({
        error: err.message || "An error occurred while managing user",
      }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
