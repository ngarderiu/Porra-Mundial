-- Allow display_name to be NULL so we can detect first-time login (needs onboarding)
ALTER TABLE profiles ALTER COLUMN display_name DROP NOT NULL;

-- Update trigger: new users get NULL display_name; onboarding sets the real name
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, display_name)
  VALUES (NEW.id, NULL)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
