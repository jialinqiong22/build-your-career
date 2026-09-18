-- Apply only to the intended environment after backup and auth migrations.
-- Latest explicit snapshot per owner and assessment kind; deletion cascades with account.
CREATE TABLE IF NOT EXISTS assessment_progress (
  user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind varchar(16) NOT NULL CHECK (kind IN ('free50', 'suite50', 'suite120')),
  payload jsonb NOT NULL CHECK (jsonb_typeof(payload) = 'object' AND octet_length(payload::text) <= 100000),
  revision uuid NOT NULL DEFAULT gen_random_uuid(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, kind)
);
