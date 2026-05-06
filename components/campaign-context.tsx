"use client"

import * as React from "react"

import {
  mockContacts,
  mockCycles,
  mockOutreachRecords,
  mockWorkspaceProfile,
} from "@/lib/mockData"

function defaultCampaignId() {
  return (
    mockCycles.find((c) => c.is_active)?.id ?? mockCycles[0]?.id ?? ""
  )
}

export type Campaign = {
  id: string
  name: string
  is_active: boolean
  created_at: string
  ask: string
}

export type OutreachRecord = (typeof mockOutreachRecords)[number]

export type Organization = {
  name: string
  generalFacts: string
  keyStats: string
}

type CampaignContextValue = {
  campaignId: string
  setCampaignId: (id: string) => void
  campaigns: Campaign[]
  updateCampaign: (id: string, patch: Partial<Pick<Campaign, "name" | "ask">>) => void
  organization: Organization
  updateOrganization: (patch: Partial<Organization>) => void
  outreachRecords: OutreachRecord[]
  addContactsToCampaign: (opts: { campaignId: string; contactIds: string[] }) => void
  getRecordCountForCampaign: (campaignId: string) => number
}

const CampaignContext = React.createContext<CampaignContextValue | null>(null)

export function CampaignProvider({ children }: { children: React.ReactNode }) {
  const [campaignId, setCampaignIdState] = React.useState(defaultCampaignId)

  const [campaigns, setCampaigns] = React.useState<Campaign[]>(() =>
    mockCycles.map((c) => ({
      ...c,
      ask:
        "We’re seeking sponsorship for Fall 2026 to fund workshop materials, cloud credits, and travel support for our project teams. Typical sponsorship tiers: $500–$3,000.",
    }))
  )

  const [outreachRecords, setOutreachRecords] =
    React.useState<OutreachRecord[]>(() => mockOutreachRecords)

  const [organization, setOrganization] = React.useState<Organization>(() => ({
    name: mockWorkspaceProfile.organization_name,
    generalFacts: mockWorkspaceProfile.mission_statement,
    keyStats: mockWorkspaceProfile.key_stats,
  }))

  const updateOrganization = React.useCallback((patch: Partial<Organization>) => {
    setOrganization((prev) => ({ ...prev, ...patch }))
  }, [])

  const setCampaignId = React.useCallback((id: string) => {
    const valid = mockCycles.some((c) => c.id === id)
    setCampaignIdState(valid ? id : defaultCampaignId())
  }, [])

  const updateCampaign = React.useCallback(
    (id: string, patch: Partial<Pick<Campaign, "name" | "ask">>) => {
      setCampaigns((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...patch } : c))
      )
    },
    []
  )

  const getRecordCountForCampaign = React.useCallback(
    (id: string) => outreachRecords.filter((r) => r.cycle_id === id).length,
    [outreachRecords]
  )

  const addContactsToCampaign = React.useCallback(
    (opts: { campaignId: string; contactIds: string[] }) => {
      const { campaignId, contactIds } = opts
      if (!mockCycles.some((c) => c.id === campaignId)) return

      setOutreachRecords((prev) => {
        const existing = new Set(
          prev
            .filter((r) => r.cycle_id === campaignId)
            .map((r) => r.contact_id)
        )

        const next: OutreachRecord[] = [...prev]
        for (const contactId of contactIds) {
          if (existing.has(contactId)) continue
          if (!mockContacts.some((c) => c.id === contactId)) continue

          next.push({
            id: `or_${campaignId}_${contactId}_${Math.random()
              .toString(16)
              .slice(2, 8)}`,
            contact_id: contactId,
            cycle_id: campaignId,
            status: "Never contacted",
            draft_subject: null,
            draft_body: null,
            internal_author: "—",
            last_contacted_date: null,
          } as OutreachRecord)
        }
        return next
      })
    },
    []
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
        addContactsToCampaign,
        getRecordCountForCampaign,
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
