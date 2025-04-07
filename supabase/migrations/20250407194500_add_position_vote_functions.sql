
-- Function to insert position votes
CREATE OR REPLACE FUNCTION public.insert_position_vote(
  p_position_id UUID,
  p_user_id UUID,
  p_privacy_level TEXT,
  p_issue_id UUID
) RETURNS VOID AS $$
BEGIN
  INSERT INTO public.position_votes (
    position_id, 
    user_id, 
    privacy_level,
    issue_id
  )
  VALUES (
    p_position_id,
    p_user_id,
    p_privacy_level,
    p_issue_id
  )
  ON CONFLICT (position_id, user_id) 
  DO UPDATE SET 
    privacy_level = p_privacy_level,
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to remove position votes
CREATE OR REPLACE FUNCTION public.remove_position_vote(
  p_position_id UUID,
  p_user_id UUID
) RETURNS VOID AS $$
BEGIN
  DELETE FROM public.position_votes
  WHERE position_id = p_position_id
  AND user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
