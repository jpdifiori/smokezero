-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO smokezero.user_config (
    user_id, 
    cigs_per_day, 
    pack_price, 
    identity_anchor
  )
  VALUES (
    new.id, 
    (new.raw_user_meta_data->>'cigs_per_day')::INTEGER, 
    (new.raw_user_meta_data->>'pack_price')::DECIMAL,
    COALESCE(new.raw_user_meta_data->>'identity_anchor', 'Libre')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function on insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
