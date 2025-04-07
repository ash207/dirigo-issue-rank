
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
    const { user_id, issue_id } = body

    if (!user_id || !issue_id) {
      return new Response(
        JSON.stringify({ error: 'User ID and issue ID are required' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    if (req.method === 'PUT') {
      // This is a request to insert a tracking record
      const { position_id } = body
      
      if (!position_id) {
        return new Response(
          JSON.stringify({ error: 'Position ID is required for tracking insertion' }),
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
    }
    
    // This is a GET request to check if tracking exists
    const { data, error } = await supabaseClient
      .from('user_vote_tracking')
      .select('user_id, position_id')
      .eq('user_id', user_id)
      .eq('issue_id', issue_id)
      .maybeSingle()

    if (error) {
      console.error('Error checking vote tracking:', error)
      throw error
    }
    
    // If tracking record exists, verify that the position still exists
    let positionExists = false
    let positionId = null
    
    if (data && data.position_id) {
      positionId = data.position_id
      const { data: positionData, error: positionError } = await supabaseClient
        .from('positions')
        .select('id')
        .eq('id', data.position_id)
        .maybeSingle()
      
      if (positionError && positionError.code !== 'PGRST116') {
        console.error('Error checking position existence:', positionError)
      } else {
        positionExists = !!positionData
      }
    }

    return new Response(
      JSON.stringify({ 
        exists: !!data && positionExists, 
        position_id: positionId,
        position_exists: positionExists
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
