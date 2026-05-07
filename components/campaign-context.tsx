"use client"

import * as React from "react"

import type {
  Campaign,
  Contact,
  Organization,
  OutreachRecord,
  WorkspaceProfileRow,
} from "@/lib/crm-types"
import { createSupabaseClient } from "@/lib/supabase"

export type { Campaign, Organization, OutreachRecord } from "@/lib/crm-types"

function toIso(value: string | null | undefined): string {
  if (!value) return new Date().toISOString()
  if (typeof value === "string" && value.includes("T")) return value
  try {
    return new Date(value).toISOString()
  } catch {
    return new Date().toISOString()
  }
}

function mapWorkspaceToOrganization(wp: WorkspaceProfileRow): Organization {
  return {
    name: wp.organization_name,
    generalFacts: wp.mission_statement,
    keyStats: wp.key_stats,
  }
}

function cyclesToCampaigns(
  cycles: {
    id: string
    name: string
    is_active: boolean
    created_at: string
  }[],
  currentAsk: string
): Campaign[] {
  return cycles.map((c) => ({
    id: c.id,
    name: c.name,
    is_active: c.is_active,
    created_at: toIso(c.created_at),
    ask: currentAsk,
  }))
}

function mapOutreachRow(row: Record<string, unknown>): OutreachRecord {
  return {
    id: String(row.id),
    contact_id: String(row.contact_id),
    cycle_id: String(row.cycle_id),
    status: row.status as OutreachRecord["status"],
    draft_subject:
      row.draft_subject === null || row.draft_subject === undefined
        ? null
        : String(row.draft_subject),
    draft_body:
      row.draft_body === null || row.draft_body === undefined
        ? null
        : String(row.draft_body),
    internal_author:
      row.internal_author === null || row.internal_author === undefined
        ? "—"
        : String(row.internal_author),
    last_contacted_date:
      row.last_contacted_date === null || row.last_contacted_date === undefined
        ? null
        : toIso(row.last_contacted_date as string),
  }
}

function mapContactRow(row: Record<string, unknown>): Contact {
  return {
    id: String(row.id),
    first_name: String(row.first_name ?? ""),
    last_name: String(row.last_name ?? ""),
    email: String(row.email ?? ""),
    company: String(row.company ?? ""),
    role: String(row.role ?? ""),
    created_at: toIso(row.created_at as string),
  }
}

const DEFAULT_WORKSPACE_INSERT: Omit<
  WorkspaceProfileRow,
  "id"
> = {
  organization_name: "Your organization",
  mission_statement: "",
  key_stats: "",
  current_ask:
    "We're seeking sponsorship for Fall 2026 to fund workshop materials, cloud credits, and travel support for our project teams. Typical sponsorship tiers: $500–$3,000.",
}

export type NewContactInput = {
  first_name: string
  last_name: string
  email: string
  company: string
  role: string
}

export type NewCampaignInput = {
  name: string
  /** When true, marks this campaign active and archives others. */
  makeActive?: boolean
}

type CampaignContextValue = {
  campaignId: string
  setCampaignId: (id: string) => void
  campaigns: Campaign[]
  updateCampaign: (
    id: string,
    patch: Partial<Pick<Campaign, "name" | "ask">>
  ) => Promise<void>
  organization: Organization
  updateOrganization: (patch: Partial<Organization>) => Promise<void>
  outreachRecords: OutreachRecord[]
  contacts: Contact[]
  addContactsToCampaign: (opts: {
    campaignId: string
    contactIds: string[]
  }) => Promise<void>
  /** Adds pipeline rows or moves existing rows so each contact ends up on the target campaign only. */
  moveContactsToCampaign: (opts: {
    campaignId: string
    contactIds: string[]
  }) => Promise<void>
  /** Moves existing outreach rows (e.g. from Outreach) to another campaign. */
  moveOutreachRecordsToCampaign: (
    recordIds: string[],
    targetCampaignId: string
  ) => Promise<void>
  createContact: (input: NewContactInput) => Promise<Contact | null>
  createCampaign: (input: NewCampaignInput) => Promise<Campaign | null>
  getRecordCountForCampaign: (campaignId: string) => number
  /** Reload cycles, contacts, outreach rows, and workspace profile from Supabase. */
  refreshData: () => Promise<void>
  ready: boolean
}

const CampaignContext = React.createContext<CampaignContextValue | null>(null)

export function CampaignProvider({
  userId,
  children,
}: {
  userId: string | null
  children: React.ReactNode
}) {
  const [campaignId, setCampaignIdState] = React.useState("")
  const [campaigns, setCampaigns] = React.useState<Campaign[]>([])
  const campaignsRef = React.useRef<Campaign[]>([])
  const [outreachRecords, setOutreachRecords] = React.useState<OutreachRecord[]>(
    []
  )
  const [contacts, setContacts] = React.useState<Contact[]>([])
  const [organization, setOrganization] = React.useState<Organization>({
    name: "",
    generalFacts: "",
    keyStats: "",
  })
  const workspaceProfileIdRef = React.useRef<string | null>(null)
  const [ready, setReady] = React.useState(!userId)

  React.useEffect(() => {
    campaignsRef.current = campaigns
  }, [campaigns])

  const reloadFromSupabase = React.useCallback(async () => {
    const supabase = createSupabaseClient()

    const wpQuery = await supabase
      .from("workspace_profile")
      .select("*")
      .limit(1)
      .maybeSingle()

    if (wpQuery.error) throw wpQuery.error

    let wp = wpQuery.data as WorkspaceProfileRow | null
    if (!wp) {
      const ins = await supabase
        .from("workspace_profile")
        .insert(DEFAULT_WORKSPACE_INSERT)
        .select("*")
        .single()
      if (ins.error) throw ins.error
      wp = ins.data as WorkspaceProfileRow
    }

    workspaceProfileIdRef.current = wp.id
    setOrganization(mapWorkspaceToOrganization(wp))

    const [cyclesRes, contactsRes, outreachRes] = await Promise.all([
      supabase.from("cycles").select("*").order("created_at", { ascending: true }),
      supabase
        .from("contacts")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase.from("outreach_records").select("*"),
    ])

    if (cyclesRes.error) throw cyclesRes.error
    if (contactsRes.error) throw contactsRes.error
    if (outreachRes.error) throw outreachRes.error

    const cycleRows = (cyclesRes.data ?? []).map((row) => ({
      id: String(row.id),
      name: String(row.name),
      is_active: Boolean(row.is_active),
      created_at: toIso(row.created_at as string),
    }))

    const mappedCampaigns = cyclesToCampaigns(cycleRows, wp.current_ask ?? "")
    campaignsRef.current = mappedCampaigns
    setCampaigns(mappedCampaigns)

    setCampaignIdState((prev) => {
      const list = mappedCampaigns
      if (prev && list.some((c) => c.id === prev)) return prev
      const next =
        list.find((c) => c.is_active)?.id ?? list[0]?.id ?? ""
      return next
    })

    setContacts((contactsRes.data ?? []).map((r) => mapContactRow(r as Record<string, unknown>)))
    setOutreachRecords(
      (outreachRes.data ?? []).map((r) => mapOutreachRow(r as Record<string, unknown>))
    )
  }, [])

  React.useEffect(() => {
    if (!userId) {
      const tick = window.requestAnimationFrame(() => {
        setCampaigns([])
        setOutreachRecords([])
        setContacts([])
        setOrganization({ name: "", generalFacts: "", keyStats: "" })
        workspaceProfileIdRef.current = null
        setCampaignIdState("")
        setReady(true)
      })
      return () => window.cancelAnimationFrame(tick)
    }

    let cancelled = false
    const readyFrame = window.requestAnimationFrame(() => setReady(false))

    const run = async () => {
      try {
        await reloadFromSupabase()
        if (!cancelled) setReady(true)
      } catch (e) {
        console.error("[CampaignProvider] Failed to load Supabase data", e)
        if (!cancelled) {
          setReady(true)
        }
      }
    }

    void run()
    return () => {
      cancelled = true
      window.cancelAnimationFrame(readyFrame)
    }
  }, [userId, reloadFromSupabase])

  const updateOrganization = React.useCallback(
    async (patch: Partial<Organization>) => {
      const id = workspaceProfileIdRef.current
      if (!id) return

      setOrganization((prev) => ({ ...prev, ...patch }))

      const row: Record<string, string> = {}
      if (patch.name !== undefined) row.organization_name = patch.name
      if (patch.generalFacts !== undefined) row.mission_statement = patch.generalFacts
      if (patch.keyStats !== undefined) row.key_stats = patch.keyStats
      if (Object.keys(row).length === 0) return

      const supabase = createSupabaseClient()
      const { error } = await supabase
        .from("workspace_profile")
        .update(row)
        .eq("id", id)
      if (error) console.error(error)
    },
    []
  )

  const updateCampaign = React.useCallback(
    async (id: string, patch: Partial<Pick<Campaign, "name" | "ask">>) => {
      const supabase = createSupabaseClient()

      if (patch.name !== undefined) {
        const { error } = await supabase
          .from("cycles")
          .update({ name: patch.name })
          .eq("id", id)
        if (error) {
          console.error(error)
          return
        }
        setCampaigns((prev) =>
          prev.map((c) => (c.id === id ? { ...c, name: patch.name! } : c))
        )
      }

      if (patch.ask !== undefined) {
        const wid = workspaceProfileIdRef.current
        if (!wid) return
        const { error } = await supabase
          .from("workspace_profile")
          .update({ current_ask: patch.ask })
          .eq("id", wid)
        if (error) {
          console.error(error)
          return
        }
        setCampaigns((prev) =>
          prev.map((c) => ({ ...c, ask: patch.ask! }))
        )
      }
    },
    []
  )

  const setCampaignId = React.useCallback((id: string) => {
    const list = campaignsRef.current
    const valid = list.some((c) => c.id === id)
    setCampaignIdState(
      valid ? id : list.find((c) => c.is_active)?.id ?? list[0]?.id ?? ""
    )
  }, [])

  const getRecordCountForCampaign = React.useCallback(
    (cid: string) => outreachRecords.filter((r) => r.cycle_id === cid).length,
    [outreachRecords]
  )

  const addContactsToCampaign = React.useCallback(
    async (opts: { campaignId: string; contactIds: string[] }) => {
      const { campaignId: cid, contactIds } = opts
      if (!campaignsRef.current.some((c) => c.id === cid)) return

      const contactSet = new Set(contacts.map((c) => c.id))
      const existing = new Set(
        outreachRecords
          .filter((r) => r.cycle_id === cid)
          .map((r) => r.contact_id)
      )

      const toAdd = contactIds.filter(
        (id) => !existing.has(id) && contactSet.has(id)
      )
      if (toAdd.length === 0) return

      const rows = toAdd.map((contact_id) => ({
        contact_id,
        cycle_id: cid,
        status: "Never contacted" as const,
        draft_subject: null,
        draft_body: null,
        internal_author: "—",
        last_contacted_date: null,
      }))

      const supabase = createSupabaseClient()
      const { data, error } = await supabase
        .from("outreach_records")
        .insert(rows)
        .select("*")

      if (error) {
        console.error(error)
        return
      }

      const inserted = (data ?? []).map((r) =>
        mapOutreachRow(r as Record<string, unknown>)
      )
      setOutreachRecords((prev) => [...prev, ...inserted])
    },
    [contacts, outreachRecords]
  )

  const moveContactsToCampaign = React.useCallback(
    async (opts: { campaignId: string; contactIds: string[] }) => {
      const { campaignId: targetId, contactIds } = opts
      if (!campaignsRef.current.some((c) => c.id === targetId)) return

      const supabase = createSupabaseClient()

      for (const contactId of contactIds) {
        const { data: rows, error: qErr } = await supabase
          .from("outreach_records")
          .select("*")
          .eq("contact_id", contactId)

        if (qErr) {
          console.error(qErr)
          continue
        }

        const related = (rows ?? []).map((r) =>
          mapOutreachRow(r as Record<string, unknown>)
        )
        const inTarget = related.find((r) => r.cycle_id === targetId)
        const elsewhere = related.filter((r) => r.cycle_id !== targetId)

        if (elsewhere.length === 0 && !inTarget) {
          await supabase.from("outreach_records").insert({
            contact_id: contactId,
            cycle_id: targetId,
            status: "Never contacted",
            draft_subject: null,
            draft_body: null,
            internal_author: "—",
            last_contacted_date: null,
          })
        } else if (elsewhere.length >= 1 && !inTarget) {
          const keep = elsewhere[0]!
          const removeIds = elsewhere.slice(1).map((r) => r.id)
          if (removeIds.length) {
            await supabase.from("outreach_records").delete().in("id", removeIds)
          }
          await supabase
            .from("outreach_records")
            .update({ cycle_id: targetId })
            .eq("id", keep.id)
        } else if (elsewhere.length >= 1 && inTarget) {
          const removeIds = elsewhere.map((r) => r.id)
          if (removeIds.length) {
            await supabase.from("outreach_records").delete().in("id", removeIds)
          }
        }
      }

      await reloadFromSupabase()
    },
    [reloadFromSupabase]
  )

  const moveOutreachRecordsToCampaign = React.useCallback(
    async (recordIds: string[], targetCampaignId: string) => {
      if (!campaignsRef.current.some((c) => c.id === targetCampaignId)) return
      const supabase = createSupabaseClient()

      for (const rid of recordIds) {
        const { data: row, error: q0 } = await supabase
          .from("outreach_records")
          .select("*")
          .eq("id", rid)
          .maybeSingle()

        if (q0) continue
        if (!row) continue
        const rec = mapOutreachRow(row as Record<string, unknown>)
        if (rec.cycle_id === targetCampaignId) continue

        const { data: dups } = await supabase
          .from("outreach_records")
          .select("id")
          .eq("contact_id", rec.contact_id)
          .eq("cycle_id", targetCampaignId)
          .neq("id", rid)

        const dupId = dups?.[0]?.id as string | undefined
        if (dupId) {
          await supabase.from("outreach_records").delete().eq("id", dupId)
        }

        const { error: upErr } = await supabase
          .from("outreach_records")
          .update({ cycle_id: targetCampaignId })
          .eq("id", rid)

        if (upErr) console.error(upErr)
      }

      await reloadFromSupabase()
    },
    [reloadFromSupabase]
  )

  const createContact = React.useCallback(async (input: NewContactInput) => {
    const supabase = createSupabaseClient()
    const { data, error } = await supabase
      .from("contacts")
      .insert({
        first_name: input.first_name.trim(),
        last_name: input.last_name.trim(),
        email: input.email.trim().toLowerCase(),
        company: input.company.trim(),
        role: input.role.trim(),
      })
      .select("*")
      .single()

    if (error) {
      console.error(error)
      return null
    }

    const c = mapContactRow(data as Record<string, unknown>)
    setContacts((prev) => [c, ...prev])
    return c
  }, [])

  const createCampaign = React.useCallback(
    async (input: NewCampaignInput) => {
      const supabase = createSupabaseClient()
      const { data: row, error } = await supabase
        .from("cycles")
        .insert({ name: input.name.trim(), is_active: false })
        .select("*")
        .single()

      if (error || !row) {
        console.error(error)
        return null
      }

      const id = String(row.id)

      if (input.makeActive) {
        await supabase.from("cycles").update({ is_active: false }).neq("id", id)
        await supabase.from("cycles").update({ is_active: true }).eq("id", id)
      }

      await reloadFromSupabase()
      return campaignsRef.current.find((c) => c.id === id) ?? null
    },
    [reloadFromSupabase]
  )

  return (
    <CampaignContext.Provider
      value={{
        campaignId,
        setCampaignId,
        campaigns,
        updateCampaign,
        organization,
        updateOrganization,
        outreachRecords,
        contacts,
        addContactsToCampaign,
        moveContactsToCampaign,
        moveOutreachRecordsToCampaign,
        createContact,
        createCampaign,
        getRecordCountForCampaign,
        refreshData: reloadFromSupabase,
        ready,
      }}
    >
      {children}
    </CampaignContext.Provider>
  )
}

export function useCampaign() {
  const ctx = React.useContext(CampaignContext)
  if (!ctx) {
    throw new Error("useCampaign must be used within CampaignProvider")
  }
  return ctx
}
