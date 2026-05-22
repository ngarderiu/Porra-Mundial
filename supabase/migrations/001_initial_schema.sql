-- Teams
CREATE TABLE teams (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  flag_emoji VARCHAR(10),
  group_letter CHAR(1) NOT NULL
);

-- Matches (pre-loaded, all 104 tournament matches)
CREATE TABLE matches (
  id SERIAL PRIMARY KEY,
  match_number INT NOT NULL UNIQUE,
  phase VARCHAR(20) NOT NULL, -- 'group'|'r32'|'r16'|'qf'|'sf'|'third'|'final'
  group_letter CHAR(1),
  home_team_id INT REFERENCES teams(id),
  away_team_id INT REFERENCES teams(id),
  home_slot VARCHAR(10), -- '1A', '2B', 'W73', 'L101'...
  away_slot VARCHAR(10),
  match_date TIMESTAMPTZ,
  stadium VARCHAR(100),
  is_locked BOOLEAN DEFAULT false
);

-- Real results (admin only)
CREATE TABLE match_results (
  id SERIAL PRIMARY KEY,
  match_id INT REFERENCES matches(id) UNIQUE,
  home_goals INT NOT NULL,
  away_goals INT NOT NULL,
  pen_winner VARCHAR(10), -- 'home'|'away'|null
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- User profiles
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  display_name VARCHAR(100) NOT NULL,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Predictions
CREATE TABLE predictions (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  match_id INT REFERENCES matches(id),
  home_goals INT NOT NULL,
  away_goals INT NOT NULL,
  pen_winner VARCHAR(10), -- 'home'|'away'|null
  submitted_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, match_id)
);

-- Trigger: automatically create profile on user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- RLS
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;

-- Teams: public read
CREATE POLICY "teams_public_read" ON teams FOR SELECT USING (true);

-- Matches: public read, admin write
CREATE POLICY "matches_public_read" ON matches FOR SELECT USING (true);
CREATE POLICY "matches_admin_write" ON matches FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

-- Match results: public read, admin write
CREATE POLICY "results_public_read" ON match_results FOR SELECT USING (true);
CREATE POLICY "results_admin_insert" ON match_results FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));
CREATE POLICY "results_admin_update" ON match_results FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

-- Profiles: public read, own write
CREATE POLICY "profiles_public_read" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_own_update" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Predictions: public read, own write
CREATE POLICY "predictions_public_read" ON predictions FOR SELECT USING (true);
CREATE POLICY "predictions_own_insert" ON predictions FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "predictions_own_update" ON predictions FOR UPDATE
  USING (auth.uid() = user_id);
