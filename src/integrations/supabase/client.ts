// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://zqgyndjnnphgxjygoxcp.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpxZ3luZGpubnBoZ3hqeWdveGNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMyNzY2MTUsImV4cCI6MjA1ODg1MjYxNX0.7CZpe5reIDh-y2er27jGr5NEDKSv0YFECPlZVPCD4xk";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);