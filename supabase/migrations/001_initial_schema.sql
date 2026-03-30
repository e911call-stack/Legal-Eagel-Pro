-- ============================================================
-- LEXORA — Complete Supabase / PostgreSQL Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── FIRMS ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS firms (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT NOT NULL,
  address         TEXT,
  city            TEXT,
  state           TEXT,
  country         TEXT DEFAULT 'US',
  jurisdiction_id TEXT DEFAULT 'US',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── USERS ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      TEXT UNIQUE NOT NULL,
  name       TEXT NOT NULL,
  role       TEXT NOT NULL CHECK (role IN ('client', 'lawyer', 'firm_admin')),
  firm_id    UUID REFERENCES firms(id) ON DELETE SET NULL,
  language   TEXT DEFAULT 'en' CHECK (language IN ('en', 'ar', 'es')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── CASES ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cases (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  firm_id        UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
  title          TEXT NOT NULL,
  practice_area  TEXT NOT NULL,
  status         TEXT DEFAULT 'open' CHECK (status IN ('open', 'pre_filing', 'in_court', 'closed')),
  risk_score     INTEGER DEFAULT 0 CHECK (risk_score BETWEEN 0 AND 100),
  risk_category  TEXT DEFAULT 'none' CHECK (risk_category IN ('none', 'inactivity', 'unanswered', 'missed_deadline')),
  budget         BIGINT,
  billing_model  TEXT CHECK (billing_model IN ('hourly', 'flat_fee')),
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ─── CASE CLIENTS / LAWYERS ──────────────────────────────────
CREATE TABLE IF NOT EXISTS case_clients (
  id      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE (case_id, user_id)
);

CREATE TABLE IF NOT EXISTS case_lawyers (
  id      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE (case_id, user_id)
);

-- ─── TASKS ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tasks (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id     UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT,
  status      TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'done')),
  assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
  due_date    TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── DEADLINES ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS deadlines (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id       UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  type          TEXT NOT NULL CHECK (type IN ('court_filing', 'internal_review', 'discovery_response')),
  due_date      TIMESTAMPTZ NOT NULL,
  internal_note TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── CASE EVENTS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS case_events (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id    UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  actor_id   UUID REFERENCES users(id) ON DELETE SET NULL,
  type       TEXT NOT NULL CHECK (type IN (
    'case_created', 'document_uploaded', 'message_sent',
    'task_updated', 'deadline_updated', 'ai_alert_generated'
  )),
  metadata   JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── AI ALERTS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ai_alerts (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id     UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  type        TEXT NOT NULL CHECK (type IN ('inactivity', 'unanswered_message', 'missed_deadline')),
  risk_level  TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high')),
  description TEXT NOT NULL,
  resolved    BOOLEAN DEFAULT FALSE,
  resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── DOCUMENTS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS documents_metadata (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id           UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  dms_document_id   TEXT NOT NULL,
  file_name         TEXT NOT NULL,
  doc_type          TEXT DEFAULT 'other' CHECK (doc_type IN ('pleading', 'contract', 'draft', 'evidence', 'other')),
  is_public_to_client BOOLEAN DEFAULT FALSE,
  uploaded_by       UUID REFERENCES users(id) ON DELETE SET NULL,
  uploaded_at       TIMESTAMPTZ DEFAULT NOW(),
  expiry_date       TIMESTAMPTZ,
  file_size         BIGINT
);

-- ─── MESSAGES ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS messages (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id           UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  sender_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content           TEXT NOT NULL,
  is_client_visible BOOLEAN DEFAULT TRUE,
  is_internal_note  BOOLEAN DEFAULT FALSE,
  status            TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'seen')),
  seen_at           TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ─── TIME ENTRIES ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS time_entries (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id          UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  lawyer_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  started_at       TIMESTAMPTZ NOT NULL,
  ended_at         TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER GENERATED ALWAYS AS (
    EXTRACT(EPOCH FROM (ended_at - started_at)) / 60
  ) STORED,
  description      TEXT,
  is_billed        BOOLEAN DEFAULT FALSE,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ─── FLAT FEE CASES ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS flat_fee_cases (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id             UUID UNIQUE NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  total_fee_cents     BIGINT NOT NULL,
  already_billed_cents BIGINT DEFAULT 0
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE cases              ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks               ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages            ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents_metadata  ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_alerts           ENABLE ROW LEVEL SECURITY;

-- Clients can only see their own cases
CREATE POLICY "clients_own_cases" ON cases
  FOR SELECT
  USING (
    id IN (SELECT case_id FROM case_clients WHERE user_id = auth.uid())
    OR
    id IN (SELECT case_id FROM case_lawyers WHERE user_id = auth.uid())
  );

-- Clients can only see their messages (client-visible)
CREATE POLICY "clients_see_own_messages" ON messages
  FOR SELECT
  USING (
    (sender_id = auth.uid() OR receiver_id = auth.uid())
    AND (
      is_client_visible = TRUE
      OR sender_id IN (SELECT id FROM users WHERE role IN ('lawyer', 'firm_admin'))
      OR receiver_id IN (SELECT id FROM users WHERE role IN ('lawyer', 'firm_admin'))
    )
  );

-- Clients only see public documents
CREATE POLICY "clients_see_public_docs" ON documents_metadata
  FOR SELECT
  USING (
    is_public_to_client = TRUE
    OR uploaded_by = auth.uid()
  );

-- ============================================================
-- AI NEGLIGENCE DETECTION ENGINE — SQL FUNCTIONS
-- ============================================================

-- Function: compute risk score for a case
CREATE OR REPLACE FUNCTION compute_case_risk(p_case_id UUID)
RETURNS TABLE (
  risk_score     INTEGER,
  risk_category  TEXT,
  risk_level     TEXT,
  issues         TEXT[]
) AS $$
DECLARE
  last_event_at     TIMESTAMPTZ;
  last_client_msg   TIMESTAMPTZ;
  last_reply_at     TIMESTAMPTZ;
  overdue_deadline  BOOLEAN;
  score             INTEGER := 0;
  category          TEXT := 'none';
  level             TEXT := 'low';
  issue_list        TEXT[] := ARRAY[]::TEXT[];
BEGIN
  -- Check 1: Last meaningful activity
  SELECT MAX(created_at) INTO last_event_at
  FROM case_events
  WHERE case_id = p_case_id
    AND type NOT IN ('ai_alert_generated');

  IF last_event_at IS NULL OR last_event_at < NOW() - INTERVAL '14 days' THEN
    score    := score + 45;
    category := 'inactivity';
    issue_list := array_append(issue_list, 'No meaningful activity in 14+ days');
  END IF;

  -- Check 2: Unanswered client messages
  SELECT MAX(created_at) INTO last_client_msg
  FROM messages
  WHERE case_id = p_case_id
    AND sender_id IN (SELECT user_id FROM case_clients WHERE case_id = p_case_id)
    AND status = 'sent';

  IF last_client_msg IS NOT NULL AND last_client_msg < NOW() - INTERVAL '72 hours' THEN
    score    := score + 30;
    category := CASE WHEN score > 45 THEN category ELSE 'unanswered' END;
    issue_list := array_append(issue_list, 'Client message unanswered for 72+ hours');
  END IF;

  -- Check 3: Overdue internal deadlines
  SELECT EXISTS(
    SELECT 1 FROM deadlines
    WHERE case_id = p_case_id
      AND type = 'internal_review'
      AND due_date < NOW()
      AND id NOT IN (
        SELECT (metadata->>'deadline_id')::UUID
        FROM case_events
        WHERE case_id = p_case_id AND type = 'deadline_updated'
          AND (metadata->>'resolved')::BOOLEAN = TRUE
      )
  ) INTO overdue_deadline;

  IF overdue_deadline THEN
    score    := score + 40;
    category := 'missed_deadline';
    issue_list := array_append(issue_list, 'Internal review deadline passed without completion');
  END IF;

  -- Cap at 100 and determine level
  score := LEAST(score, 100);
  level := CASE
    WHEN score >= 70 THEN 'high'
    WHEN score >= 40 THEN 'medium'
    ELSE 'low'
  END;

  RETURN QUERY SELECT score, category, level, issue_list;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: run full AI engine for all active cases in a firm
CREATE OR REPLACE FUNCTION run_negligence_engine(p_firm_id UUID)
RETURNS INTEGER AS $$
DECLARE
  c RECORD;
  r RECORD;
  alert_count INTEGER := 0;
BEGIN
  FOR c IN
    SELECT id, title FROM cases
    WHERE firm_id = p_firm_id AND status != 'closed'
  LOOP
    SELECT * INTO r FROM compute_case_risk(c.id);

    -- Update case risk score
    UPDATE cases
    SET risk_score    = r.risk_score,
        risk_category = r.risk_category,
        updated_at    = NOW()
    WHERE id = c.id;

    -- Create alert if risk is medium or high
    IF r.risk_level IN ('medium', 'high') THEN
      INSERT INTO ai_alerts (case_id, type, risk_level, description)
      SELECT c.id, r.risk_category, r.risk_level,
        CONCAT('Risk score ', r.risk_score, '/100. ', array_to_string(r.issues, '. '))
      WHERE NOT EXISTS (
        SELECT 1 FROM ai_alerts
        WHERE case_id = c.id
          AND type = r.risk_category
          AND resolved = FALSE
          AND created_at > NOW() - INTERVAL '24 hours'
      );

      -- Log event
      INSERT INTO case_events (case_id, type, metadata)
      VALUES (c.id, 'ai_alert_generated', jsonb_build_object(
        'risk_score', r.risk_score,
        'risk_level', r.risk_level,
        'alert_type', r.risk_category
      ));

      alert_count := alert_count + 1;
    END IF;
  END LOOP;

  RETURN alert_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- INDEXES for performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_cases_firm_id      ON cases(firm_id);
CREATE INDEX IF NOT EXISTS idx_cases_status        ON cases(status);
CREATE INDEX IF NOT EXISTS idx_cases_risk_score    ON cases(risk_score DESC);
CREATE INDEX IF NOT EXISTS idx_case_events_case_id ON case_events(case_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_case_id    ON messages(case_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_alerts_case_id   ON ai_alerts(case_id, resolved, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tasks_case_id       ON tasks(case_id, status);
