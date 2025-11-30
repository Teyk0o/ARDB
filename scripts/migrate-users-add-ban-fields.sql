-- Migration: Add ban fields to users table
-- Date: 2025-11-30
-- Description: Adds is_banned, ban_reason, banned_at, and banned_by fields to support user banning

-- Add new columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS ban_reason TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS banned_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS banned_by INTEGER REFERENCES users(id) ON DELETE SET NULL;

-- Create index on is_banned for faster queries
CREATE INDEX IF NOT EXISTS idx_users_is_banned ON users(is_banned);

-- Verify migration
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'users'
  AND column_name IN ('is_banned', 'ban_reason', 'banned_at', 'banned_by')
ORDER BY column_name;
