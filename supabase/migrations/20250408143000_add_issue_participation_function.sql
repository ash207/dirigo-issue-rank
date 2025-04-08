
-- Create a function to check a user's participation in an issue
CREATE OR REPLACE FUNCTION public.check_issue_participation(p_user_id UUID, p_issue_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  participation_exists BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM public.user_issue_participation
    WHERE user_id = p_user_id AND issue_id = p_issue_id
  ) INTO participation_exists;
  
  RETURN participation_exists;
END;
$$;
