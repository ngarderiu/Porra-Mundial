CREATE TABLE settings (
  key VARCHAR(50) PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO settings VALUES ('deadline', '2026-06-10T22:00:00Z', now());

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "settings_public_read" ON settings FOR SELECT USING (true);
CREATE POLICY "settings_admin_update" ON settings FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));
CREATE POLICY "settings_admin_insert" ON settings FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));
