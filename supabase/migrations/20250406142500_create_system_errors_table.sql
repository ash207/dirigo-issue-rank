
-- Create system_errors table
CREATE TABLE IF NOT EXISTS system_errors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  error_type TEXT NOT NULL,
  error_message TEXT NOT NULL,
  component TEXT,
  user_id UUID,
  browser_info JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create function to create the system_errors table from RPC
CREATE OR REPLACE FUNCTION create_system_errors_table_if_not_exists()
RETURNS void AS $$
BEGIN
  -- Check if the table exists
  IF NOT EXISTS (
    SELECT FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename = 'system_errors'
  ) THEN
    -- Create the table
    CREATE TABLE public.system_errors (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      error_type TEXT NOT NULL,
      error_message TEXT NOT NULL,
      component TEXT,
      user_id UUID,
      browser_info JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
    );
    
    -- Add indexes
    CREATE INDEX idx_system_errors_user_id ON public.system_errors(user_id);
    CREATE INDEX idx_system_errors_component ON public.system_errors(component);
    CREATE INDEX idx_system_errors_error_type ON public.system_errors(error_type);
    CREATE INDEX idx_system_errors_created_at ON public.system_errors(created_at);
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Enable RLS
ALTER TABLE public.system_errors ENABLE ROW LEVEL SECURITY;

-- Create policy to allow read access for authenticated users
CREATE POLICY "Allow admins to view system errors"
  ON public.system_errors
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE 
        profiles.id = auth.uid() AND 
        profiles.role IN ('dirigo_admin', 'politician_admin')
    )
  );

-- Create policy to allow insert for anyone (authenticated or not)
CREATE POLICY "Allow inserts to system_errors"
  ON public.system_errors
  FOR INSERT
  WITH CHECK (true);
