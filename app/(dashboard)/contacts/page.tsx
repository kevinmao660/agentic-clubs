"use client"

import * as React from "react"

import { buildOutreachHistoryForCompany } from "@/lib/outreach-memory"

import { useCampaign } from "@/components/campaign-context"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ArrowUpDownIcon, UserPlus } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type SortKey = "name" | "company" | "role" | "email"
type SortDir = "asc" | "desc"

function statusVariant(
  status: string
): "default" | "secondary" | "outline" | "destructive" {
  switch (status) {
    case "Agreed":
      return "default"
    case "In conversation":
      return "secondary"
    case "Outreaching":
      return "outline"
    case "Needs Review":
      return "secondary"
    case "Declined":
      return "destructive"
    case "Never contacted":
    default:
      return "outline"
  }
}

type ContactsPageInnerProps = {
  campaigns: ReturnType<typeof useCampaign>["campaigns"]
  campaignId: string
  contacts: ReturnType<typeof useCampaign>["contacts"]
  outreachRecords: ReturnType<typeof useCampaign>["outreachRecords"]
  addContactsToCampaign: ReturnType<
    typeof useCampaign
  >["addContactsToCampaign"]
  moveContactsToCampaign: ReturnType<
    typeof useCampaign
  >["moveContactsToCampaign"]
  createContact: ReturnType<typeof useCampaign>["createContact"]
}

function ContactsPageInner({
  campaigns,
  campaignId,
  contacts,
  outreachRecords,
  addContactsToCampaign,
  moveContactsToCampaign,
  createContact,
}: ContactsPageInnerProps) {
  const [newContactOpen, setNewContactOpen] = React.useState(false)
  const [newContact, setNewContact] = React.useState({
    first_name: "",
    last_name: "",
    email: "",
    company: "",
    role: "",
  })
  const [savingContact, setSavingContact] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [selectedCompany, setSelectedCompany] = React.useState<string | null>(
    null
  )
  const [selectedContacts, setSelectedContacts] = React.useState<Set<string>>(
    () => new Set()
  )
  const [targetCampaignId, setTargetCampaignId] =
    React.useState<string>(campaignId)

  const targetCampaignName = React.useMemo(
    () =>
      campaigns.find((c) => c.id === targetCampaignId)?.name ??
      "Select campaign",
    [campaigns, targetCampaignId]
  )

  const contactsCampaignSelectValue = React.useMemo(() => {
    if (campaigns.some((c) => c.id === targetCampaignId)) return targetCampaignId
    return campaigns[0]?.id ?? campaignId ?? ""
  }, [campaigns, targetCampaignId, campaignId])

  React.useEffect(() => {
    if (campaigns.length === 0) return
    if (campaigns.some((c) => c.id === targetCampaignId)) return
    setTargetCampaignId(campaigns[0]?.id ?? campaignId)
  }, [campaigns, targetCampaignId, campaignId])

  const [sort, setSort] = React.useState<{ key: SortKey; dir: SortDir }>({
    key: "name",
    dir: "asc",
  })

  function toggleSort(key: SortKey) {
    setSort((prev) => {
      if (prev.key !== key) return { key, dir: "asc" }
      return { key, dir: prev.dir === "asc" ? "desc" : "asc" }
    })
  }

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return contacts
    return contacts.filter((c) => {
      const hay = `${c.first_name} ${c.last_name} ${c.email} ${c.company} ${c.role}`.toLowerCase()
      return hay.includes(q)
    })
  }, [contacts, query])

  const sorted = React.useMemo(() => {
    const dir = sort.dir === "asc" ? 1 : -1
    const arr = [...filtered]
    arr.sort((a, b) => {
      const aName = `${a.first_name} ${a.last_name}`
      const bName = `${b.first_name} ${b.last_name}`
      let av = ""
      let bv = ""
      switch (sort.key) {
        case "company":
          av = a.company
          bv = b.company
          break
        case "role":
          av = a.role
          bv = b.role
          break
        case "email":
          av = a.email
          bv = b.email
          break
        case "name":
        default:
          av = aName
          bv = bName
          break
      }
      return av.localeCompare(bv) * dir
    })
    return arr
  }, [filtered, sort.dir, sort.key])

  const allSelected =
    sorted.length > 0 && selectedContacts.size === sorted.length

  function toggleContact(id: string, next: boolean) {
    setSelectedContacts((prev) => {
      const copy = new Set(prev)
      if (next) copy.add(id)
      else copy.delete(id)
      return copy
    })
  }

  function toggleAll(next: boolean) {
    if (!next) return setSelectedContacts(new Set())
    setSelectedContacts(new Set(sorted.map((c) => c.id)))
  }

  function addSelectedToCampaign() {
    void addContactsToCampaign({
      campaignId: targetCampaignId,
      contactIds: Array.from(selectedContacts),
    })
    setSelectedContacts(new Set())
  }

  function moveSelectedToCampaign() {
    void moveContactsToCampaign({
      campaignId: targetCampaignId,
      contactIds: Array.from(selectedContacts),
    })
    setSelectedContacts(new Set())
  }

  async function handleCreateContact(e: React.FormEvent) {
    e.preventDefault()
    setSavingContact(true)
    const c = await createContact(newContact)
    setSavingContact(false)
    if (c) {
      setNewContactOpen(false)
      setNewContact({
        first_name: "",
        last_name: "",
        email: "",
        company: "",
        role: "",
      })
    }
  }

  const memory = React.useMemo(() => {
    if (!selectedCompany) return []
    return buildOutreachHistoryForCompany(
      selectedCompany,
      contacts,
      outreachRecords,
      campaigns
    )
  }, [selectedCompany, contacts, outreachRecords, campaigns])

  const selectedPrimaryContact = React.useMemo(() => {
    if (!selectedCompany) return null
    return contacts.find((c) => c.company === selectedCompany) ?? null
  }, [contacts, selectedCompany])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Contacts</h1>
        <p className="text-muted-foreground">
          Click a row to open the Memory Panel (outreach history by company).
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <Button
          type="button"
          variant="outline"
          className="shrink-0 gap-2"
          onClick={() => setNewContactOpen(true)}
        >
          <UserPlus className="size-4" />
          New contact
        </Button>
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search contacts, companies, roles, emails…"
          className="max-w-md min-w-[12rem] flex-1"
        />
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={contactsCampaignSelectValue}
            onValueChange={(v) =>
              setTargetCampaignId(
                v && campaigns.some((c) => c.id === v) ? v : campaignId
              )
            }
            disabled={campaigns.length === 0}
          >
            <SelectTrigger
              aria-label="Target campaign"
              className="min-w-56 max-w-[14rem] justify-between gap-2"
            >
              <span className="min-w-0 flex-1 truncate text-left font-medium">
                {campaigns.length === 0 ? "No campaigns yet" : targetCampaignName}
              </span>
            </SelectTrigger>
            <SelectContent>
              {campaigns.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="secondary"
            disabled={
              selectedContacts.size === 0 ||
              campaigns.length === 0 ||
              !targetCampaignId
            }
            onClick={addSelectedToCampaign}
          >
            Add to campaign
          </Button>
          <Button
            variant="outline"
            disabled={
              selectedContacts.size === 0 ||
              campaigns.length === 0 ||
              !targetCampaignId
            }
            onClick={moveSelectedToCampaign}
          >
            Move to campaign
          </Button>
        </div>
        <div className="text-sm text-muted-foreground sm:ml-auto">
          {sorted.length} contacts
        </div>
      </div>

      <Dialog open={newContactOpen} onOpenChange={setNewContactOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleCreateContact}>
            <DialogHeader>
              <DialogTitle>New contact</DialogTitle>
              <DialogDescription>
                Add someone to the directory. Email must be unique.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-3 py-4">
              <div className="grid gap-1.5 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <div className="text-xs text-muted-foreground">First name</div>
                  <Input
                    required
                    value={newContact.first_name}
                    onChange={(e) =>
                      setNewContact((p) => ({ ...p, first_name: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <div className="text-xs text-muted-foreground">Last name</div>
                  <Input
                    required
                    value={newContact.last_name}
                    onChange={(e) =>
                      setNewContact((p) => ({ ...p, last_name: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="text-xs text-muted-foreground">Email</div>
                <Input
                  type="email"
                  required
                  className="font-mono text-sm"
                  value={newContact.email}
                  onChange={(e) =>
                    setNewContact((p) => ({ ...p, email: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <div className="text-xs text-muted-foreground">Company</div>
                <Input
                  required
                  value={newContact.company}
                  onChange={(e) =>
                    setNewContact((p) => ({ ...p, company: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <div className="text-xs text-muted-foreground">Role</div>
                <Input
                  value={newContact.role}
                  onChange={(e) =>
                    setNewContact((p) => ({ ...p, role: e.target.value }))
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setNewContactOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={savingContact}>
                {savingContact ? "Saving…" : "Create contact"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  aria-label="Select all"
                  checked={allSelected}
                  onCheckedChange={(v) => toggleAll(Boolean(v))}
                />
              </TableHead>
              <TableHead className="w-[220px]">
                <Button
                  variant="ghost"
                  size="sm"
                  className="-ml-3 gap-2"
                  onClick={() => toggleSort("name")}
                >
                  Name
                  <ArrowUpDownIcon className="size-4 text-muted-foreground" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="-ml-3 gap-2"
                  onClick={() => toggleSort("company")}
                >
                  Company
                  <ArrowUpDownIcon className="size-4 text-muted-foreground" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="-ml-3 gap-2"
                  onClick={() => toggleSort("role")}
                >
                  Role
                  <ArrowUpDownIcon className="size-4 text-muted-foreground" />
                </Button>
              </TableHead>
              <TableHead className="w-[260px]">
                <Button
                  variant="ghost"
                  size="sm"
                  className="-ml-3 gap-2"
                  onClick={() => toggleSort("email")}
                >
                  Email
                  <ArrowUpDownIcon className="size-4 text-muted-foreground" />
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((c) => (
              <TableRow
                key={c.id}
                className="cursor-pointer"
                onClick={() => setSelectedCompany(c.company)}
              >
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    aria-label={`Select ${c.first_name} ${c.last_name}`}
                    checked={selectedContacts.has(c.id)}
                    onCheckedChange={(v) => toggleContact(c.id, Boolean(v))}
                  />
                </TableCell>
                <TableCell className="font-medium">
                  {c.first_name} {c.last_name}
                </TableCell>
                <TableCell>{c.company}</TableCell>
                <TableCell className="text-muted-foreground">{c.role}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {c.email}
                </TableCell>
              </TableRow>
            ))}
            {sorted.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No matches.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Sheet open={!!selectedCompany} onOpenChange={(open) => !open && setSelectedCompany(null)}>
        <SheetContent side="right" className="w-[520px] sm:max-w-[520px] p-0">
          <SheetHeader className="p-5">
            <SheetTitle>Memory Panel</SheetTitle>
            <SheetDescription>
              Past outreach context for this company.
            </SheetDescription>
          </SheetHeader>

          <Separator />

          <div className="p-5 space-y-4">
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Company</div>
              <div className="text-lg font-semibold tracking-tight">
                {selectedCompany ?? "—"}
              </div>
              {selectedPrimaryContact && (
                <div className="text-sm text-muted-foreground">
                  Primary contact:{" "}
                  <span className="text-foreground">
                    {selectedPrimaryContact.first_name}{" "}
                    {selectedPrimaryContact.last_name}
                  </span>{" "}
                  · <span className="font-mono">{selectedPrimaryContact.email}</span>
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="font-medium">Outreach history</div>
                <div className="text-sm text-muted-foreground">
                  {memory.length} record{memory.length === 1 ? "" : "s"}
                </div>
              </div>

              {memory.length === 0 ? (
                <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
                  No outreach history found for this company yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {memory.map((r) => (
                    <div
                      key={r.id}
                      className="rounded-xl border bg-card p-4 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-0.5">
                          <div className="text-sm font-medium">
                            {r.campaign.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {r.last_contacted_date
                              ? `Last touched: ${new Date(
                                  r.last_contacted_date
                                ).toLocaleDateString()}`
                              : "No outreach sent yet"}
                            {" · "}
                            {r.internal_author}
                          </div>
                        </div>
                        <Badge variant={statusVariant(r.status)}>
                          {r.status}
                        </Badge>
                      </div>

                      {(r.draft_subject || r.draft_body) && (
                        <div className="mt-3 space-y-2">
                          {r.draft_subject && (
                            <div className="text-xs">
                              <div className="text-muted-foreground">
                                Draft subject
                              </div>
                              <div className="font-medium">{r.draft_subject}</div>
                            </div>
                          )}
                          {r.draft_body && (
                            <div className="text-xs">
                              <div className="text-muted-foreground">
                                Draft body (AI)
                              </div>
                              <div className="mt-1 whitespace-pre-wrap rounded-lg border bg-muted/30 p-3 text-[12px] leading-5">
                                {r.draft_body}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

export default function ContactsPage() {
  const {
    campaigns,
    campaignId,
    addContactsToCampaign,
    moveContactsToCampaign,
    createContact,
    contacts,
    outreachRecords,
  } = useCampaign()
  return (
    <ContactsPageInner
      key={campaignId}
      campaigns={campaigns}
      campaignId={campaignId}
      contacts={contacts}
      outreachRecords={outreachRecords}
      addContactsToCampaign={addContactsToCampaign}
      moveContactsToCampaign={moveContactsToCampaign}
      createContact={createContact}
    />
  )
}
