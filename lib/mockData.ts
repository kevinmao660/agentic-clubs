export type Workspace_Profile = {
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

export type Cycle = {
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

export type Outreach_Record = {
  id: string
  contact_id: string
  cycle_id: string
  status: OutreachStatus
  draft_subject: string | null
  draft_body: string | null
  internal_author: string
  last_contacted_date: string | null
}

export const mockWorkspaceProfile: Workspace_Profile = {
  id: "wp_0f1b8d62-6a3f-4a06-8a08-08f8c0a7a3d1",
  organization_name: "NovaTech @ State University",
  mission_statement:
    "NovaTech is a student-run community building practical engineering skills through workshops, hack nights, and mentorship. We connect students with industry partners to ship real projects and grow inclusive tech leadership.",
  key_stats:
    "150+ active members • 35% first-year students • 22 student-led projects shipped • 18 workshops per semester • 12 partner companies hosted on campus",
  current_ask:
    "We’re seeking sponsorship for Fall 2026 to fund workshop materials, cloud credits, and travel support for our project teams. Typical sponsorship tiers: $500–$3,000.",
}

export const mockCycles: Cycle[] = [
  {
    id: "cy_4a0c8d8f-0b9a-4b9f-8f6e-0ce6a5b8b3e1",
    name: "Spring 2026 Partnerships",
    is_active: false,
    created_at: "2026-01-10T10:00:00.000Z",
  },
  {
    id: "cy_9b3d3d31-7a73-4c89-b0a8-9e9d75e1b2ac",
    name: "Fall 2026 Sponsorships",
    is_active: true,
    created_at: "2026-05-01T14:30:00.000Z",
  },
  {
    id: "cy_0d6a7d9b-2d5f-4f5a-9b7b-7b2d20b8d7f0",
    name: "Winter 2026 Guest Speakers",
    is_active: false,
    created_at: "2026-02-20T18:15:00.000Z",
  },
]

export const mockContacts: Contact[] = [
  {
    id: "ct_01c7b4d4-8f3d-4d9d-9c2a-2d65a8f2c1a1",
    first_name: "Maya",
    last_name: "Chen",
    email: "maya.chen@northpeak.ai",
    company: "NorthPeak AI",
    role: "Head of Developer Relations",
    created_at: "2026-03-02T16:12:00.000Z",
  },
  {
    id: "ct_02c1b7a1-1b1b-4d5b-9d9c-8c2f6f9a2b02",
    first_name: "Jordan",
    last_name: "Patel",
    email: "jordan.patel@riverbank.capital",
    company: "Riverbank Capital",
    role: "VP, Portfolio Operations",
    created_at: "2026-03-14T09:40:00.000Z",
  },
  {
    id: "ct_03d1b3c0-2a5d-4b5b-8f44-4a6b0f6f3b03",
    first_name: "Elena",
    last_name: "Garcia",
    email: "elena.garcia@orbitcloud.com",
    company: "OrbitCloud",
    role: "Engineering Manager, Platform",
    created_at: "2026-02-11T12:20:00.000Z",
  },
  {
    id: "ct_04a8c2e2-3a1c-4f99-9f23-1f2c3a4b5c04",
    first_name: "Sam",
    last_name: "Okafor",
    email: "sam.okafor@brightbyte.io",
    company: "BrightByte",
    role: "Recruiting Lead, University Programs",
    created_at: "2026-01-28T18:05:00.000Z",
  },
  {
    id: "ct_05e8a9f1-0d2a-4b80-8f12-7e1a2b3c4d05",
    first_name: "Priya",
    last_name: "Nair",
    email: "priya.nair@finleaf.com",
    company: "FinLeaf",
    role: "Director, Partnerships",
    created_at: "2026-04-05T11:10:00.000Z",
  },
  {
    id: "ct_06f3c1d2-9b8a-4a12-8c45-3a2b1c0d9e06",
    first_name: "Aiden",
    last_name: "Brooks",
    email: "aiden.brooks@hollowaysecurity.com",
    company: "Holloway Security",
    role: "Senior Security Engineer",
    created_at: "2026-04-22T20:42:00.000Z",
  },
  {
    id: "ct_07b2a1c3-4d5e-4f60-9a70-1b2c3d4e5f07",
    first_name: "Nina",
    last_name: "Kowalski",
    email: "nina.kowalski@heliohealth.tech",
    company: "Helio Health",
    role: "Product Manager",
    created_at: "2026-03-19T15:55:00.000Z",
  },
  {
    id: "ct_08c9d7e6-5f4a-4b3c-8d2e-1a0b9c8d7e08",
    first_name: "Omar",
    last_name: "Hassan",
    email: "omar.hassan@copperlane.com",
    company: "Copperlane Logistics",
    role: "Director of Data",
    created_at: "2026-02-03T08:30:00.000Z",
  },
  {
    id: "ct_09d0a1b2-6c7d-4e5f-8a90-0f1e2d3c4b09",
    first_name: "Sofia",
    last_name: "Rossi",
    email: "sofia.rossi@atlasrobotics.com",
    company: "Atlas Robotics",
    role: "Community & Events Manager",
    created_at: "2026-04-12T13:15:00.000Z",
  },
  {
    id: "ct_10a2b3c4-7d8e-4f90-9a1b-2c3d4e5f6a10",
    first_name: "Drew",
    last_name: "Nguyen",
    email: "drew.nguyen@quarryanalytics.com",
    company: "Quarry Analytics",
    role: "Staff Data Scientist",
    created_at: "2026-01-16T10:22:00.000Z",
  },
  {
    id: "ct_11b3c4d5-8e9f-4a01-8b2c-3d4e5f6a7b11",
    first_name: "Hannah",
    last_name: "Kim",
    email: "hannah.kim@seabird.dev",
    company: "Seabird Dev Tools",
    role: "Founder",
    created_at: "2026-03-08T17:48:00.000Z",
  },
  {
    id: "ct_12c4d5e6-9f0a-4b12-9c3d-4e5f6a7b8c12",
    first_name: "Leo",
    last_name: "Martinez",
    email: "leo.martinez@evergreenpayments.com",
    company: "Evergreen Payments",
    role: "Enterprise Account Executive",
    created_at: "2026-04-01T09:05:00.000Z",
  },
  {
    id: "ct_13d5e6f7-0a1b-4c23-8d4e-5f6a7b8c9d13",
    first_name: "Amara",
    last_name: "Singh",
    email: "amara.singh@lumenstudio.co",
    company: "Lumen Studio",
    role: "Creative Technologist",
    created_at: "2026-02-26T14:12:00.000Z",
  },
  {
    id: "ct_14e6f7a8-1b2c-4d34-9e5f-6a7b8c9d0e14",
    first_name: "Ben",
    last_name: "Williams",
    email: "ben.williams@oakridgebio.com",
    company: "Oakridge Bio",
    role: "Director, R&D Informatics",
    created_at: "2026-03-26T19:03:00.000Z",
  },
  {
    id: "ct_15f7a8b9-2c3d-4e45-8f60-7b8c9d0e1f15",
    first_name: "Keira",
    last_name: "Johnson",
    email: "keira.johnson@redwoodsystems.io",
    company: "Redwood Systems",
    role: "University Recruiting Manager",
    created_at: "2026-01-22T11:35:00.000Z",
  },
  {
    id: "ct_16a8b9c0-3d4e-4f56-9a71-8c9d0e1f2a16",
    first_name: "Ishaan",
    last_name: "Desai",
    email: "ishaan.desai@prismcommerce.com",
    company: "Prism Commerce",
    role: "Director of Engineering",
    created_at: "2026-04-18T16:28:00.000Z",
  },
  {
    id: "ct_17b9c0d1-4e5f-4a67-8b82-9d0e1f2a3b17",
    first_name: "Claire",
    last_name: "Thompson",
    email: "claire.thompson@starlitmedia.com",
    company: "Starlit Media",
    role: "Sponsorships Coordinator",
    created_at: "2026-03-30T10:10:00.000Z",
  },
  {
    id: "ct_18c0d1e2-5f60-4b78-9c93-0e1f2a3b4c18",
    first_name: "Mateo",
    last_name: "Silva",
    email: "mateo.silva@ventureforge.com",
    company: "VentureForge",
    role: "Associate, Talent & Community",
    created_at: "2026-02-07T13:50:00.000Z",
  },
  {
    id: "ct_19d1e2f3-6071-4c89-8da4-1f2a3b4c5d19",
    first_name: "Rachel",
    last_name: "Adams",
    email: "rachel.adams@silverlineconsulting.com",
    company: "Silverline Consulting",
    role: "Managing Consultant",
    created_at: "2026-01-09T08:12:00.000Z",
  },
  {
    id: "ct_20e2f3a4-7182-4d90-9eb5-2a3b4c5d6e20",
    first_name: "Theo",
    last_name: "Baker",
    email: "theo.baker@pinecone.edu",
    company: "Pinecone EdTech",
    role: "Partnerships Lead",
    created_at: "2026-04-27T12:00:00.000Z",
  },
]

const cycleById = Object.fromEntries(mockCycles.map((c) => [c.id, c]))

function iso(date: string) {
  return new Date(date).toISOString()
}

export const mockOutreachRecords: Outreach_Record[] = [
  // Spring 2026
  {
    id: "or_1001",
    contact_id: mockContacts[0]!.id,
    cycle_id: mockCycles[0]!.id,
    status: "In conversation",
    draft_subject: null,
    draft_body: null,
    internal_author: "Ava (Outreach)",
    last_contacted_date: iso("2026-03-12T14:20:00.000Z"),
  },
  {
    id: "or_1002",
    contact_id: mockContacts[3]!.id,
    cycle_id: mockCycles[0]!.id,
    status: "Agreed",
    draft_subject: null,
    draft_body: null,
    internal_author: "Noah (Treasurer)",
    last_contacted_date: iso("2026-03-25T17:05:00.000Z"),
  },
  {
    id: "or_1003",
    contact_id: mockContacts[9]!.id,
    cycle_id: mockCycles[0]!.id,
    status: "Declined",
    draft_subject: null,
    draft_body: null,
    internal_author: "Mia (President)",
    last_contacted_date: iso("2026-02-18T16:30:00.000Z"),
  },

  // Winter 2026 speakers
  {
    id: "or_2001",
    contact_id: mockContacts[10]!.id,
    cycle_id: mockCycles[2]!.id,
    status: "Agreed",
    draft_subject: null,
    draft_body: null,
    internal_author: "Ethan (Events)",
    last_contacted_date: iso("2026-03-05T19:00:00.000Z"),
  },
  {
    id: "or_2002",
    contact_id: mockContacts[12]!.id,
    cycle_id: mockCycles[2]!.id,
    status: "Outreaching",
    draft_subject: null,
    draft_body: null,
    internal_author: "Ethan (Events)",
    last_contacted_date: iso("2026-03-08T15:45:00.000Z"),
  },

  // Fall 2026 (active)
  {
    id: "or_3001",
    contact_id: mockContacts[1]!.id,
    cycle_id: mockCycles[1]!.id,
    status: "Never contacted",
    draft_subject: null,
    draft_body: null,
    internal_author: "—",
    last_contacted_date: null,
  },
  {
    id: "or_3002",
    contact_id: mockContacts[2]!.id,
    cycle_id: mockCycles[1]!.id,
    status: "Needs Review",
    draft_subject: "Fall 2026 sponsorship — NovaTech @ State University",
    draft_body:
      "Hi Elena,\n\nI’m reaching out from NovaTech @ State University, a student-run tech club focused on hands-on engineering workshops and mentorship.\n\nWe’re putting together our Fall 2026 workshop series (cloud + platform engineering) and would love to explore a sponsorship from OrbitCloud. Sponsorship helps us fund workshop materials, cloud credits for student projects, and travel support for our project teams.\n\nIf helpful, I can share a one-page overview and our typical tiers ($500–$3,000). Would you be open to a quick 15-minute chat next week?\n\nBest,\nAva\nNovaTech @ State University",
    internal_author: "Ava (Outreach)",
    last_contacted_date: null,
  },
  {
    id: "or_3003",
    contact_id: mockContacts[4]!.id,
    cycle_id: mockCycles[1]!.id,
    status: "Outreaching",
    draft_subject: null,
    draft_body: null,
    internal_author: "Noah (Treasurer)",
    last_contacted_date: iso("2026-05-03T13:10:00.000Z"),
  },
  {
    id: "or_3004",
    contact_id: mockContacts[5]!.id,
    cycle_id: mockCycles[1]!.id,
    status: "In conversation",
    draft_subject: null,
    draft_body: null,
    internal_author: "Mia (President)",
    last_contacted_date: iso("2026-05-02T18:40:00.000Z"),
  },
  {
    id: "or_3005",
    contact_id: mockContacts[6]!.id,
    cycle_id: mockCycles[1]!.id,
    status: "Needs Review",
    draft_subject: "Partner with NovaTech students this fall?",
    draft_body:
      "Hi Nina,\n\nI’m reaching out from NovaTech @ State University. We run high-impact workshops and a student project incubator, and we’re currently lining up partners for our Fall 2026 season.\n\nWould Helio Health be open to sponsoring a workshop (or providing cloud/product credits) to support student teams building health-tech prototypes? We can highlight Helio at the event, share recruiting opportunities, and feature your engineers in a Q&A.\n\nIf you’re open, I can send a short overview and propose a few sponsorship options.\n\nThanks,\nNoah\nNovaTech",
    internal_author: "Noah (Treasurer)",
    last_contacted_date: null,
  },
  {
    id: "or_3006",
    contact_id: mockContacts[7]!.id,
    cycle_id: mockCycles[1]!.id,
    status: "Declined",
    draft_subject: null,
    draft_body: null,
    internal_author: "Ava (Outreach)",
    last_contacted_date: iso("2026-05-01T21:15:00.000Z"),
  },
  {
    id: "or_3007",
    contact_id: mockContacts[8]!.id,
    cycle_id: mockCycles[1]!.id,
    status: "Agreed",
    draft_subject: null,
    draft_body: null,
    internal_author: "Mia (President)",
    last_contacted_date: iso("2026-05-04T10:05:00.000Z"),
  },
  {
    id: "or_3008",
    contact_id: mockContacts[11]!.id,
    cycle_id: mockCycles[1]!.id,
    status: "Never contacted",
    draft_subject: null,
    draft_body: null,
    internal_author: "—",
    last_contacted_date: null,
  },
  {
    id: "or_3009",
    contact_id: mockContacts[13]!.id,
    cycle_id: mockCycles[1]!.id,
    status: "Outreaching",
    draft_subject: null,
    draft_body: null,
    internal_author: "Ava (Outreach)",
    last_contacted_date: iso("2026-05-02T12:25:00.000Z"),
  },
  {
    id: "or_3010",
    contact_id: mockContacts[14]!.id,
    cycle_id: mockCycles[1]!.id,
    status: "In conversation",
    draft_subject: null,
    draft_body: null,
    internal_author: "Noah (Treasurer)",
    last_contacted_date: iso("2026-05-03T16:55:00.000Z"),
  },
  {
    id: "or_3011",
    contact_id: mockContacts[15]!.id,
    cycle_id: mockCycles[1]!.id,
    status: "Needs Review",
    draft_subject: "NovaTech sponsorship + recruiting touchpoint",
    draft_body:
      "Hi Ishaan,\n\nI’m Ava with NovaTech @ State University. We’re a student-run tech club running workshops (web, data, infra) and student project teams, and we’re looking for partners for Fall 2026.\n\nWould Prism Commerce consider sponsoring our workshop series? Sponsorship goes directly toward materials + cloud credits, and we can offer visibility to students plus a recruiting touchpoint (resume book / coffee chat) if helpful.\n\nIf you’re open, I can share a one-pager and set up a quick call.\n\nBest,\nAva",
    internal_author: "Ava (Outreach)",
    last_contacted_date: null,
  },
  {
    id: "or_3012",
    contact_id: mockContacts[16]!.id,
    cycle_id: mockCycles[1]!.id,
    status: "Never contacted",
    draft_subject: null,
    draft_body: null,
    internal_author: "—",
    last_contacted_date: null,
  },
  {
    id: "or_3013",
    contact_id: mockContacts[17]!.id,
    cycle_id: mockCycles[1]!.id,
    status: "Outreaching",
    draft_subject: null,
    draft_body: null,
    internal_author: "Mia (President)",
    last_contacted_date: iso("2026-05-04T14:45:00.000Z"),
  },
  {
    id: "or_3014",
    contact_id: mockContacts[18]!.id,
    cycle_id: mockCycles[1]!.id,
    status: "Needs Review",
    draft_subject: "Sponsorship opportunity — NovaTech Fall 2026",
    draft_body:
      "Hi Rachel,\n\nI’m reaching out from NovaTech @ State University. This fall we’re running an expanded workshop program and student project incubator, and we’re partnering with a small set of companies to sponsor materials and student resources.\n\nWould Silverline Consulting be open to a modest sponsorship (starting at $500) to support student-led engineering projects? In return we can offer brand placement at events and a chance to engage with students interested in consulting + analytics.\n\nIf you’re the right person, I’d love to share a short overview.\n\nThanks,\nNoah\nNovaTech",
    internal_author: "Noah (Treasurer)",
    last_contacted_date: null,
  },
  {
    id: "or_3015",
    contact_id: mockContacts[19]!.id,
    cycle_id: mockCycles[1]!.id,
    status: "In conversation",
    draft_subject: null,
    draft_body: null,
    internal_author: "Ava (Outreach)",
    last_contacted_date: iso("2026-05-05T16:20:00.000Z"),
  },
]

export function getOutreachRecordCountForCycle(cycleId: string) {
  return mockOutreachRecords.filter((r) => r.cycle_id === cycleId).length
}

export function getOutreachHistoryForCompany(company: string) {
  const contactIds = new Set(
    mockContacts.filter((c) => c.company === company).map((c) => c.id)
  )

  return mockOutreachRecords
    .filter((r) => contactIds.has(r.contact_id))
    .map((r) => ({
      ...r,
      cycle: cycleById[r.cycle_id]!,
      contact: mockContacts.find((c) => c.id === r.contact_id)!,
    }))
    .sort((a, b) => {
      const ad = a.last_contacted_date ?? a.cycle.created_at
      const bd = b.last_contacted_date ?? b.cycle.created_at
      return bd.localeCompare(ad)
    })
}

