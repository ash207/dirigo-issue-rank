
-- Function to check if a vote tracking record exists
CREATE OR REPLACE FUNCTION public.check_vote_tracking(
  p_user_id UUID,
  p_issue_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  tracking_exists BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM public.user_vote_tracking
    WHERE user_id = p_user_id AND issue_id = p_issue_id
  ) INTO tracking_exists;
  
  RETURN tracking_exists;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to delete a vote tracking record
CREATE OR REPLACE FUNCTION public.delete_vote_tracking(
  p_user_id UUID,
  p_issue_id UUID
) RETURNS VOID AS $$
BEGIN
  DELETE FROM public.user_vote_tracking
  WHERE user_id = p_user_id AND issue_id = p_issue_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
