import type { Campaign, Contact, OutreachRecord } from "@/lib/crm-types"

export type OutreachHistoryEntry = OutreachRecord & {
  campaign: Pick<Campaign, "id" | "name" | "created_at" | "is_active">
  contact: Contact
}

/**
 * Past outreach for every contact at the given company (all campaigns), newest activity first.
 */
export function buildOutreachHistoryForCompany(
  company: string,
  contacts: Contact[],
  outreachRecords: OutreachRecord[],
  campaigns: Campaign[]
): OutreachHistoryEntry[] {
  const contactIds = new Set(
    contacts.filter((c) => c.company === company).map((c) => c.id)
  )
  const campaignById = Object.fromEntries(campaigns.map((c) => [c.id, c]))

  const entries: OutreachHistoryEntry[] = []
  for (const r of outreachRecords) {
    if (!contactIds.has(r.contact_id)) continue
    const campaign = campaignById[r.cycle_id]
    const contact = contacts.find((c) => c.id === r.contact_id)
    if (!campaign || !contact) continue
    entries.push({ ...r, campaign, contact })
  }
  entries.sort((a, b) => {
    const ad = a.last_contacted_date ?? a.campaign.created_at
    const bd = b.last_contacted_date ?? b.campaign.created_at
    return bd.localeCompare(ad)
  })
  return entries
}

