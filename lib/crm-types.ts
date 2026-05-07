/** Domain types aligned with Supabase tables (project_spec §3). */

export type WorkspaceProfileRow = {
  id: string
  organization_name: string
  mission_statement: string
  key_stats: string
  current_ask: string
}

export type Contact = {
  id: string
  first_name: string
  last_name: string
  email: string
  company: string
  role: string
  created_at: string
}

export type CycleRow = {
  id: string
  name: string
  is_active: boolean
  created_at: string
}

export type OutreachStatus =
  | "Never contacted"
  | "Needs Review"
  | "Outreaching"
  | "In conversation"
  | "Agreed"
  | "Declined"

export type OutreachRecord = {
  id: string
  contact_id: string
  cycle_id: string
  status: OutreachStatus
  draft_subject: string | null
  draft_body: string | null
  internal_author: string
  last_contacted_date: string | null
}

/** Cycle plus UI-only ask (mapped from `workspace_profile.current_ask`). */
export type Campaign = CycleRow & { ask: string }

export type Organization = {
  name: string
  generalFacts: string
  keyStats: string
}
