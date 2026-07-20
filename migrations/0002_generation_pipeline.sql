PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('video', 'text', 'pdf', 'italian', 'voice')),
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'processing', 'completed', 'failed')),
  source_text TEXT NOT NULL,
  source_file_name TEXT,
  settings_json TEXT NOT NULL,
  script_json TEXT NOT NULL,
  duration_seconds INTEGER NOT NULL CHECK (duration_seconds BETWEEN 5 AND 60),
  poster_asset_id TEXT,
  output_asset_id TEXT,
  error_code TEXT,
  error_message TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS projects_user_updated_index
  ON projects(user_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS projects_user_status_index
  ON projects(user_id, status, updated_at DESC);

CREATE TABLE IF NOT EXISTS provider_calls (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  project_id TEXT,
  kind TEXT NOT NULL CHECK (kind IN ('script')),
  provider TEXT NOT NULL DEFAULT 'kie',
  provider_model TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('processing', 'completed', 'failed')),
  provider_credits REAL NOT NULL DEFAULT 0 CHECK (provider_credits >= 0),
  error_message TEXT,
  created_at INTEGER NOT NULL,
  completed_at INTEGER,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS provider_calls_user_created_index
  ON provider_calls(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS generation_jobs (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'completed', 'failed')),
  reserved_credits INTEGER NOT NULL CHECK (reserved_credits >= 0),
  charged_credits INTEGER NOT NULL DEFAULT 0 CHECK (charged_credits >= 0),
  provider_credits REAL NOT NULL DEFAULT 0 CHECK (provider_credits >= 0),
  error_code TEXT,
  error_message TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  completed_at INTEGER,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS generation_jobs_project_created_index
  ON generation_jobs(project_id, created_at DESC);

CREATE INDEX IF NOT EXISTS generation_jobs_user_status_index
  ON generation_jobs(user_id, status, updated_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS generation_jobs_one_active_project_index
  ON generation_jobs(project_id)
  WHERE status IN ('queued', 'processing');

CREATE TABLE IF NOT EXISTS generation_steps (
  id TEXT PRIMARY KEY,
  job_id TEXT NOT NULL,
  project_id TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('image', 'voice', 'video')),
  sequence INTEGER NOT NULL DEFAULT 0 CHECK (sequence >= 0),
  provider TEXT NOT NULL DEFAULT 'kie',
  provider_model TEXT NOT NULL,
  provider_task_id TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'processing', 'finalizing', 'completed', 'failed')),
  input_json TEXT NOT NULL,
  result_json TEXT,
  expected_provider_credits REAL NOT NULL DEFAULT 0 CHECK (expected_provider_credits >= 0),
  provider_credits REAL NOT NULL DEFAULT 0 CHECK (provider_credits >= 0),
  error_code TEXT,
  error_message TEXT,
  last_polled_at INTEGER,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  completed_at INTEGER,
  FOREIGN KEY (job_id) REFERENCES generation_jobs(id) ON DELETE CASCADE,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  UNIQUE (job_id, kind, sequence)
);

CREATE INDEX IF NOT EXISTS generation_steps_job_status_index
  ON generation_steps(job_id, status, sequence);

CREATE INDEX IF NOT EXISTS generation_steps_provider_task_index
  ON generation_steps(provider_task_id);

CREATE TABLE IF NOT EXISTS media_assets (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  step_id TEXT,
  kind TEXT NOT NULL CHECK (kind IN ('image', 'audio', 'video')),
  storage_path TEXT NOT NULL UNIQUE,
  content_type TEXT NOT NULL,
  byte_size INTEGER NOT NULL CHECK (byte_size >= 0),
  duration_seconds REAL,
  width INTEGER,
  height INTEGER,
  provider_url TEXT,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (step_id) REFERENCES generation_steps(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS media_assets_project_created_index
  ON media_assets(project_id, created_at DESC);

CREATE INDEX IF NOT EXISTS media_assets_user_index
  ON media_assets(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS credit_reservations (
  id TEXT PRIMARY KEY,
  job_id TEXT NOT NULL UNIQUE,
  user_id TEXT NOT NULL,
  amount INTEGER NOT NULL CHECK (amount > 0),
  status TEXT NOT NULL DEFAULT 'reserved' CHECK (status IN ('reserved', 'charged', 'returned')),
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (job_id) REFERENCES generation_jobs(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS credit_reservations_user_status_index
  ON credit_reservations(user_id, status, updated_at DESC);

CREATE TRIGGER IF NOT EXISTS validate_generation_credits
BEFORE INSERT ON credit_reservations
WHEN NOT EXISTS (
  SELECT 1 FROM users
  WHERE id = NEW.user_id
    AND billing_hold = 0
    AND credits >= NEW.amount
)
BEGIN
  SELECT RAISE(ABORT, 'insufficient_generation_credits');
END;

CREATE TRIGGER IF NOT EXISTS reserve_generation_credits
AFTER INSERT ON credit_reservations
BEGIN
  UPDATE users
    SET credits = credits - NEW.amount,
        updated_at = NEW.created_at
    WHERE id = NEW.user_id;

  INSERT INTO credit_ledger (
    id, user_id, amount, balance_after, kind, description, source_event_id, created_at
  ) VALUES (
    NEW.id || ':reserve',
    NEW.user_id,
    -NEW.amount,
    (SELECT credits FROM users WHERE id = NEW.user_id),
    'generation_reservation',
    'Generation credits reserved',
    'generation:reserve:' || NEW.job_id,
    NEW.created_at
  );
END;

CREATE TRIGGER IF NOT EXISTS return_generation_credits
AFTER UPDATE OF status ON credit_reservations
WHEN OLD.status = 'reserved' AND NEW.status = 'returned'
BEGIN
  UPDATE users
    SET credits = credits + NEW.amount,
        updated_at = NEW.updated_at
    WHERE id = NEW.user_id;

  INSERT INTO credit_ledger (
    id, user_id, amount, balance_after, kind, description, source_event_id, created_at
  ) VALUES (
    NEW.id || ':return',
    NEW.user_id,
    NEW.amount,
    (SELECT credits FROM users WHERE id = NEW.user_id),
    'generation_return',
    'Generation credits returned',
    'generation:return:' || NEW.job_id,
    NEW.updated_at
  );
END;

CREATE TABLE IF NOT EXISTS provider_events (
  id TEXT PRIMARY KEY,
  provider_task_id TEXT NOT NULL,
  payload_hash TEXT NOT NULL UNIQUE,
  state TEXT,
  status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'processed', 'ignored', 'failed')),
  error TEXT,
  created_at INTEGER NOT NULL,
  processed_at INTEGER
);

CREATE INDEX IF NOT EXISTS provider_events_task_created_index
  ON provider_events(provider_task_id, created_at DESC);
