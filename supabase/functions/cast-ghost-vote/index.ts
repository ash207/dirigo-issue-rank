
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
    const { positionId } = body
    
    console.log("Edge function received:", body);

    if (!positionId) {
      return new Response(
        JSON.stringify({ error: 'Position ID is required' }),
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
      .eq('id', positionId)
      .maybeSingle()
    
    if (positionCheckError) {
      console.error('Error checking position existence:', positionCheckError)
      throw positionCheckError
    }
    
    // Don't record a ghost vote for a non-existent position
    if (!positionExists) {
      return new Response(
        JSON.stringify({ 
          error: 'Cannot cast ghost vote for non-existent position', 
          success: false
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        }
      )
    }
    
    // Use the increment_anonymous_vote function
    const { data, error } = await supabaseClient.rpc(
      'increment_anonymous_vote',
      { p_position_id: positionId }
    )
    
    if (error) {
      console.error('Error incrementing anonymous vote:', error)
      throw error
    }
    
    return new Response(
      JSON.stringify({ success: true, data }),
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
