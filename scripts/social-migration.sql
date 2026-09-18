-- Apply separately after account schema; enabling SOCIAL_ENABLED requires this migration.
CREATE TABLE IF NOT EXISTS social_invites (
 token_hash varchar(64) PRIMARY KEY, owner_hash varchar(64) NOT NULL,
 participant_hash varchar(64), owner_user_id integer REFERENCES users(id) ON DELETE CASCADE,
 kind text NOT NULL CHECK (kind IN ('compare','feedback')), status text NOT NULL,
 data jsonb NOT NULL, expires_at timestamptz NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
 last_accessed_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS social_invites_expiry_idx ON social_invites(expires_at);
