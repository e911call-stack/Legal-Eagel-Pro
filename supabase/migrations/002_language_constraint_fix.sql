-- Migration 002: Expand users.language to support all 5 app languages
-- Run this in Supabase SQL Editor if you already deployed 001

ALTER TABLE users DROP CONSTRAINT IF EXISTS users_language_check;
ALTER TABLE users ADD CONSTRAINT users_language_check
  CHECK (language IN ('en', 'ar', 'es', 'zh', 'hi'));

-- Verify
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'users'::regclass
  AND conname = 'users_language_check';
