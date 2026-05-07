-- Hermes / Outreach CRM — initial schema (matches project_spec.md §3)
-- Run in Supabase: SQL Editor → New query → paste → Run

-- ---------------------------------------------------------------------------
-- Types
-- ---------------------------------------------------------------------------

CREATE TYPE outreach_status AS ENUM (
  'Never contacted',
  'Needs Review',
  'Outreaching',
  'In conversation',
  'Agreed',
  'Declined'
);

-- ---------------------------------------------------------------------------
-- 1. Workspace_Profile — global AI / org context
-- ---------------------------------------------------------------------------

CREATE TABLE workspace_profile (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
  organization_name text NOT NULL,
  mission_statement text NOT NULL DEFAULT '',
  key_stats text NOT NULL DEFAULT '',
  current_ask text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now (),
  updated_at timestamptz NOT NULL DEFAULT now ()
);

COMMENT ON TABLE workspace_profile IS 'Workspace_Profile: global settings for AI context';

-- ---------------------------------------------------------------------------
-- 2. Contacts — master directory
-- ---------------------------------------------------------------------------

CREATE TABLE contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  company text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now (),
  CONSTRAINT contacts_email_unique UNIQUE (email)
);

CREATE INDEX contacts_company_idx ON contacts (company);
CREATE INDEX contacts_created_at_idx ON contacts (created_at DESC);

COMMENT ON TABLE contacts IS 'Contacts: master directory';

-- ---------------------------------------------------------------------------
-- 3. Cycles — time-bound campaigns
-- ---------------------------------------------------------------------------

CREATE TABLE cycles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
  name text NOT NULL,
  is_active boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now ()
);

CREATE INDEX cycles_is_active_idx ON cycles (is_active) WHERE is_active = true;

COMMENT ON TABLE cycles IS 'Cycles: time-bound organizational containers';

-- ---------------------------------------------------------------------------
-- 4. Outreach_Records — junction + pipeline state
-- ---------------------------------------------------------------------------

CREATE TABLE outreach_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
  contact_id uuid NOT NULL REFERENCES contacts (id) ON DELETE CASCADE,
  cycle_id uuid NOT NULL REFERENCES cycles (id) ON DELETE CASCADE,
  status outreach_status NOT NULL DEFAULT 'Never contacted',
  draft_subject text,
  draft_body text,
  internal_author text NOT NULL DEFAULT '',
  last_contacted_date timestamptz,
  created_at timestamptz NOT NULL DEFAULT now (),
  updated_at timestamptz NOT NULL DEFAULT now (),
  CONSTRAINT outreach_records_contact_cycle_unique UNIQUE (contact_id, cycle_id)
);

CREATE INDEX outreach_records_cycle_id_idx ON outreach_records (cycle_id);
CREATE INDEX outreach_records_contact_id_idx ON outreach_records (contact_id);
CREATE INDEX outreach_records_status_idx ON outreach_records (status);
CREATE INDEX outreach_records_last_contacted_idx ON outreach_records (last_contacted_date DESC NULLS LAST);

COMMENT ON TABLE outreach_records IS 'Outreach_Records: junction table + dynamic outreach state';

-- ---------------------------------------------------------------------------
-- updated_at touch triggers (optional but handy)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION set_updated_at ()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now ();
  RETURN NEW;
END;
$$;

CREATE TRIGGER workspace_profile_set_updated_at
BEFORE UPDATE ON workspace_profile
FOR EACH ROW
EXECUTE PROCEDURE set_updated_at ();

CREATE TRIGGER outreach_records_set_updated_at
BEFORE UPDATE ON outreach_records
FOR EACH ROW
EXECUTE PROCEDURE set_updated_at ();
