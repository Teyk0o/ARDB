-- Arc Raiders Database - Community Collaboration System
-- Database Schema for PostgreSQL (Vercel Postgres)

-- Table: users
-- Stores Discord-authenticated users
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  discord_id VARCHAR(255) UNIQUE NOT NULL,
  discord_username VARCHAR(255) NOT NULL,
  discord_avatar VARCHAR(255),
  discord_discriminator VARCHAR(10),
  is_moderator BOOLEAN DEFAULT FALSE,
  is_banned BOOLEAN DEFAULT FALSE,
  ban_reason TEXT,
  banned_at TIMESTAMP,
  banned_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Table: item_edits
-- Stores all edit proposals (pending, approved, rejected)
CREATE TABLE IF NOT EXISTS item_edits (
  id SERIAL PRIMARY KEY,
  item_id VARCHAR(255) NOT NULL,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  edit_data JSONB NOT NULL,
  original_data JSONB NOT NULL,
  reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  reviewed_at TIMESTAMP,
  reviewed_by INTEGER REFERENCES users(id) ON DELETE SET NULL
);

-- Table: edit_comments
-- Stores comments on edit proposals
CREATE TABLE IF NOT EXISTS edit_comments (
  id SERIAL PRIMARY KEY,
  edit_id INTEGER REFERENCES item_edits(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table: item_overrides
-- Stores approved item modifications that override JSON data
CREATE TABLE IF NOT EXISTS item_overrides (
  id SERIAL PRIMARY KEY,
  item_id VARCHAR(255) UNIQUE NOT NULL,
  override_data JSONB NOT NULL,
  modified_fields TEXT[] NOT NULL,
  last_edit_id INTEGER REFERENCES item_edits(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Table: item_history
-- Complete audit trail of all item changes
CREATE TABLE IF NOT EXISTS item_history (
  id SERIAL PRIMARY KEY,
  item_id VARCHAR(255) NOT NULL,
  edit_id INTEGER REFERENCES item_edits(id) ON DELETE SET NULL,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  changes JSONB NOT NULL,
  action VARCHAR(50) NOT NULL CHECK (action IN ('create', 'update', 'approve', 'reject', 'edit')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table: sync_conflicts
-- Tracks conflicts between RaidTheory syncs and community edits
CREATE TABLE IF NOT EXISTS sync_conflicts (
  id SERIAL PRIMARY KEY,
  item_id VARCHAR(255) NOT NULL,
  conflict_data JSONB NOT NULL,
  resolved BOOLEAN DEFAULT FALSE,
  resolved_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  resolution_type VARCHAR(50) CHECK (resolution_type IN ('keep_community', 'keep_raidtheory', 'merge', NULL)),
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_item_edits_status ON item_edits(status);
CREATE INDEX IF NOT EXISTS idx_item_edits_item_id ON item_edits(item_id);
CREATE INDEX IF NOT EXISTS idx_item_edits_user_id ON item_edits(user_id);
CREATE INDEX IF NOT EXISTS idx_item_edits_created_at ON item_edits(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_item_overrides_item_id ON item_overrides(item_id);
CREATE INDEX IF NOT EXISTS idx_sync_conflicts_resolved ON sync_conflicts(resolved);
CREATE INDEX IF NOT EXISTS idx_sync_conflicts_item_id ON sync_conflicts(item_id);
CREATE INDEX IF NOT EXISTS idx_item_history_item_id ON item_history(item_id);
CREATE INDEX IF NOT EXISTS idx_item_history_created_at ON item_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_edit_comments_edit_id ON edit_comments(edit_id);
CREATE INDEX IF NOT EXISTS idx_users_discord_id ON users(discord_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for users table
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for item_overrides table
CREATE TRIGGER update_item_overrides_updated_at BEFORE UPDATE ON item_overrides
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
