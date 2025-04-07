
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Parse request body
    const body = await req.json()
    const { user_id, issue_id, position_id } = body

    if (!user_id || !issue_id || !position_id) {
      return new Response(
        JSON.stringify({ 
          error: 'User ID, issue ID, and position ID are all required' 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }
    
    // First, check if position exists in positions table
    const { data: positionExists, error: positionCheckError } = await supabaseClient
      .from('positions')
      .select('id')
      .eq('id', position_id)
      .single()
    
    if (positionCheckError && positionCheckError.code !== 'PGRST116') { // PGRST116 is "No rows returned" error
      console.error('Error checking position existence:', positionCheckError)
      throw positionCheckError
    }
    
    // Don't record a ghost vote for a non-existent position
    if (!positionExists) {
      return new Response(
        JSON.stringify({ 
          error: 'Cannot track ghost vote for non-existent position', 
          exists: false,
          position_id: null
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        }
      )
    }
    
    // Check if there's already a ghost vote for this user on this issue
    const { data: existingTracking, error: trackingCheckError } = await supabaseClient
      .from('user_vote_tracking')
      .select('id')
      .eq('user_id', user_id)
      .eq('issue_id', issue_id)
      .maybeSingle()
      
    if (trackingCheckError) {
      console.error('Error checking existing tracking:', trackingCheckError)
      throw trackingCheckError
    }
    
    // If there's already tracking, return an error
    if (existingTracking) {
      return new Response(
        JSON.stringify({ 
          error: 'User already has a ghost vote on this issue', 
          exists: true,
          success: false
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 409, // Conflict
        }
      )
    }
    
    // Insert the tracking record
    const { error } = await supabaseClient
      .from('user_vote_tracking')
      .insert({
        user_id,
        issue_id,
        position_id
      })
    
    if (error) {
      console.error('Error inserting vote tracking:', error)
      throw error
    }
    
    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message, success: false }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
