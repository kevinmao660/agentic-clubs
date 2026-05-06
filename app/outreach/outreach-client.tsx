"use client"

import * as React from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { mockContacts, mockCycles } from "@/lib/mockData"

import { useCampaign } from "@/components/campaign-context"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ArrowUpDownIcon, Loader2Icon, SparklesIcon } from "lucide-react"

function statusBadgeClass(status: string) {
  switch (status) {
    case "Agreed":
      return "border-emerald-500/25 bg-emerald-500/15 text-emerald-800 dark:text-emerald-200"
    case "Needs Review":
      return "border-purple-500/25 bg-purple-500/15 text-purple-900 dark:text-purple-200"
    case "In conversation":
      return "border-amber-500/25 bg-amber-500/15 text-amber-900 dark:text-amber-200"
    case "Outreaching":
      return "border-sky-500/25 bg-sky-500/15 text-sky-900 dark:text-sky-200"
    case "Declined":
      return "border-rose-500/25 bg-rose-500/15 text-rose-900 dark:text-rose-200"
    case "Never contacted":
    default:
      return "border-border bg-muted/30 text-muted-foreground"
  }
}

function formatDate(iso: string | null) {
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString()
}

type GeneratedDraft = {
  recordId: string
  toName: string
  toEmail: string
  company: string
  subject: string
  body: string
}

function fillTemplate(
  template: string,
  vars: Record<string, string | undefined>
) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => vars[key] ?? "")
}

const SUBJECT_TEMPLATE =
  "{{Org_Name}} — partnership with {{Company}}"

const BODY_TEMPLATE =
  "Hi {{First_Name}},\n\nI’m reaching out from {{Org_Name}}.\n\nWe run hands-on engineering workshops and student projects, and we’re lining up partners for our current campaign.\n\n{{Custom_Ask}}\n\nIf you’re open, I can share a short overview and a few options. Would a quick 15-minute chat next week work?\n\nBest,\n{{Sender_Name}}\n{{Org_Name}}"

export function OutreachClient() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { setCampaignId, outreachRecords, campaigns, organization } =
    useCampaign()

  const defaultCycleId = React.useMemo(
    () => mockCycles.find((c) => c.is_active)?.id ?? mockCycles[0]?.id ?? "",
    []
  )

  const cycleFromUrl = searchParams.get("cycle")
  const initialCycleId =
    cycleFromUrl && mockCycles.some((c) => c.id === cycleFromUrl)
      ? cycleFromUrl
      : defaultCycleId

  const [cycleId, setCycleIdState] = React.useState(initialCycleId)
  const [selected, setSelected] = React.useState<Set<string>>(() => new Set())
  const [draftOpen, setDraftOpen] = React.useState(false)
  const [prompt, setPrompt] = React.useState("")
  const [isGenerating, setIsGenerating] = React.useState(false)
  const [generated, setGenerated] = React.useState<GeneratedDraft[] | null>(null)
  const [memoryOpen, setMemoryOpen] = React.useState(false)
  const [memoryCompany, setMemoryCompany] = React.useState<string | null>(null)
  const [memoryFocusRecordId, setMemoryFocusRecordId] = React.useState<
    string | null
  >(null)
  const [sort, setSort] = React.useState<{
    key:
      | "company"
      | "contact"
      | "status"
      | "last_contacted_date"
      | "internal_author"
    dir: "asc" | "desc"
  }>({ key: "last_contacted_date", dir: "desc" })

  React.useEffect(() => {
    const q = searchParams.get("cycle")
    if (q && mockCycles.some((c) => c.id === q)) {
      setCycleIdState((prev) => (prev === q ? prev : q))
    }
  }, [searchParams])

  const selectedCycle = React.useMemo(
    () => mockCycles.find((c) => c.id === cycleId) ?? null,
    [cycleId]
  )

  function setCycleFromUi(nextId: string) {
    const next =
      mockCycles.some((c) => c.id === nextId) ? nextId : defaultCycleId
    setCycleIdState(next)
    const params = new URLSearchParams(searchParams.toString())
    params.set("cycle", next)
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  React.useEffect(() => {
    setCampaignId(cycleId)
  }, [cycleId, setCampaignId])

  function toggleSort(
    key:
      | "company"
      | "contact"
      | "status"
      | "last_contacted_date"
      | "internal_author"
  ) {
    setSort((prev) => {
      if (prev.key !== key) return { key, dir: "asc" }
      return { key, dir: prev.dir === "asc" ? "desc" : "asc" }
    })
  }

  const rows = React.useMemo(() => {
    const cycle = mockCycles.find((c) => c.id === cycleId) ?? null
    const items = outreachRecords
      .filter((r) => r.cycle_id === cycleId)
      .map((r) => {
        const contact = mockContacts.find((c) => c.id === r.contact_id)
        if (!contact) return null
        return {
          record: r,
          contact,
          cycle,
        }
      })
      .filter((x): x is NonNullable<typeof x> => x !== null)

    return items
  }, [cycleId, outreachRecords])

  const companyHistory = React.useMemo(() => {
    if (!memoryCompany) return []
    const contactIds = new Set(
      mockContacts
        .filter((c) => c.company === memoryCompany)
        .map((c) => c.id)
    )
    return outreachRecords
      .filter((r) => contactIds.has(r.contact_id))
      .map((r) => {
        const contact = mockContacts.find((c) => c.id === r.contact_id)!
        const cycleMeta =
          campaigns.find((c) => c.id === r.cycle_id) ??
          mockCycles.find((c) => c.id === r.cycle_id) ??
          campaigns[0]!
        return { record: r, contact, cycleMeta }
      })
      .sort((a, b) => {
        const ad = a.record.last_contacted_date ?? a.cycleMeta.created_at
        const bd = b.record.last_contacted_date ?? b.cycleMeta.created_at
        return bd.localeCompare(ad)
      })
  }, [memoryCompany, outreachRecords, campaigns])

  const peopleAtMemoryCompany = React.useMemo(() => {
    if (!memoryCompany) return []
    return mockContacts.filter((c) => c.company === memoryCompany)
  }, [memoryCompany])

  const sortedRows = React.useMemo(() => {
    const dir = sort.dir === "asc" ? 1 : -1
    const arr = [...rows]
    arr.sort((a, b) => {
      let av = ""
      let bv = ""
      switch (sort.key) {
        case "company":
          av = a.contact.company
          bv = b.contact.company
          break
        case "contact":
          av = `${a.contact.first_name} ${a.contact.last_name}`
          bv = `${b.contact.first_name} ${b.contact.last_name}`
          break
        case "status":
          av = a.record.status
          bv = b.record.status
          break
        case "internal_author":
          av = a.record.internal_author
          bv = b.record.internal_author
          break
        case "last_contacted_date":
        default:
          av = a.record.last_contacted_date ?? ""
          bv = b.record.last_contacted_date ?? ""
          break
      }
      return av.localeCompare(bv) * dir
    })
    return arr
  }, [rows, sort.dir, sort.key])

  React.useEffect(() => {
    setSelected(new Set())
  }, [cycleId])

  const allSelected = rows.length > 0 && selected.size === rows.length
  const selectedRows = React.useMemo(
    () => sortedRows.filter((r) => selected.has(r.record.id)),
    [sortedRows, selected]
  )

  function toggleRow(id: string, next: boolean) {
    setSelected((prev) => {
      const copy = new Set(prev)
      if (next) copy.add(id)
      else copy.delete(id)
      return copy
    })
  }

  function toggleAll(next: boolean) {
    if (!next) {
      setSelected(new Set())
      return
    }
    setSelected(new Set(sortedRows.map((r) => r.record.id)))
  }

  function openDraftModal() {
    if (selected.size === 0) return
    setDraftOpen(true)
  }

  function closeDraftModal(open: boolean) {
    setDraftOpen(open)
    if (!open) {
      setIsGenerating(false)
      setGenerated(null)
      setPrompt("")
    }
  }

  async function handleGenerate(target?: Array<(typeof selectedRows)[number]>) {
    const source = target ?? selectedRows
    if (source.length === 0 || isGenerating) return

    setIsGenerating(true)
    setGenerated(null)

    await new Promise((r) => setTimeout(r, 2000))

    const sender = "Ava"
    const customAsk =
      prompt.trim().length > 0
        ? prompt.trim()
        : "If helpful, we can start with a modest tier ($500–$1,500) and tailor benefits around your goals (student visibility, recruiting touchpoints, or a guest speaker slot)."

    const drafts: GeneratedDraft[] = source.map(({ record, contact }) => {
      const vars = {
        First_Name: contact.first_name,
        Company: contact.company,
        Sender_Name: sender,
        Custom_Ask: customAsk,
        Org_Name: organization.name,
      }
      return {
        recordId: record.id,
        toName: `${contact.first_name} ${contact.last_name}`,
        toEmail: contact.email,
        company: contact.company,
        subject: fillTemplate(SUBJECT_TEMPLATE, vars),
        body: fillTemplate(BODY_TEMPLATE, vars),
      }
    })

    setGenerated(drafts)
    setIsGenerating(false)
  }

  function openDraftForSingleRow(recordId: string) {
    const row = sortedRows.find((r) => r.record.id === recordId)
    if (!row) return
    setSelected(new Set([recordId]))
    setDraftOpen(true)
    setPrompt("")
    queueMicrotask(() => {
      void handleGenerate([row])
    })
  }

  function openCompanyMemory(company: string, focusRecordId: string) {
    setMemoryCompany(company)
    setMemoryFocusRecordId(focusRecordId)
    setMemoryOpen(true)
  }

  function closeCompanyMemory(open: boolean) {
    setMemoryOpen(open)
    if (!open) {
      setMemoryCompany(null)
      setMemoryFocusRecordId(null)
    }
  }

  function generateEmailFromMemory() {
    if (!memoryFocusRecordId) return
    setMemoryOpen(false)
    setMemoryCompany(null)
    const id = memoryFocusRecordId
    setMemoryFocusRecordId(null)
    queueMicrotask(() => openDraftForSingleRow(id))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Outreach</h1>
          <p className="text-muted-foreground">
            Click a row for company history across campaigns. Use checkboxes to
            multi-select rows.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={openDraftModal}
            disabled={selected.size === 0}
            className="gap-2"
          >
            <SparklesIcon className="size-4" />
            Draft with AI
          </Button>
          <div className="text-sm text-muted-foreground whitespace-nowrap">
            Cycle
          </div>
          <Select
            value={cycleId}
            onValueChange={(v) => setCycleFromUi(v ?? defaultCycleId)}
          >
            <SelectTrigger
              aria-label="Select cycle"
              className="min-w-64 max-w-[18rem] justify-between gap-2"
            >
              <span className="min-w-0 flex-1 truncate text-left font-medium">
                {selectedCycle?.name ?? "Select cycle"}
              </span>
              {selectedCycle?.is_active ? (
                <Badge variant="secondary" className="shrink-0 text-[10px]">
                  Active
                </Badge>
              ) : null}
            </SelectTrigger>
            <SelectContent align="end">
              {mockCycles.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5 text-left">
                    <span className="truncate font-medium">{c.name}</span>
                    {c.is_active ? (
                      <span className="text-xs text-muted-foreground">
                        Active campaign
                      </span>
                    ) : null}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing <span className="text-foreground">{rows.length}</span> record
          {rows.length === 1 ? "" : "s"} · Selected{" "}
          <span className="text-foreground">{selected.size}</span>
        </div>
      </div>

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
                  onClick={() => toggleSort("contact")}
                >
                  Contact
                  <ArrowUpDownIcon className="size-4 text-muted-foreground" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="-ml-3 gap-2"
                  onClick={() => toggleSort("status")}
                >
                  Status
                  <ArrowUpDownIcon className="size-4 text-muted-foreground" />
                </Button>
              </TableHead>
              <TableHead className="w-[170px]">
                <Button
                  variant="ghost"
                  size="sm"
                  className="-ml-3 gap-2"
                  onClick={() => toggleSort("last_contacted_date")}
                >
                  Last contacted
                  <ArrowUpDownIcon className="size-4 text-muted-foreground" />
                </Button>
              </TableHead>
              <TableHead className="w-[170px]">
                <Button
                  variant="ghost"
                  size="sm"
                  className="-ml-3 gap-2"
                  onClick={() => toggleSort("internal_author")}
                >
                  Internal author
                  <ArrowUpDownIcon className="size-4 text-muted-foreground" />
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedRows.map(({ record, contact }) => (
              <TableRow
                key={record.id}
                className="cursor-pointer hover:bg-muted/40"
                onClick={() => openCompanyMemory(contact.company, record.id)}
              >
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    aria-label={`Select ${contact.company}`}
                    checked={selected.has(record.id)}
                    onCheckedChange={(v) => toggleRow(record.id, Boolean(v))}
                  />
                </TableCell>
                <TableCell className="font-medium">{contact.company}</TableCell>
                <TableCell>
                  <div className="leading-tight">
                    <div className="font-medium">
                      {contact.first_name} {contact.last_name}
                    </div>
                    <div className="text-xs text-muted-foreground font-mono">
                      {contact.email}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={statusBadgeClass(record.status)}
                  >
                    {record.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(record.last_contacted_date)}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {record.internal_author}
                </TableCell>
              </TableRow>
            ))}

            {sortedRows.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No outreach records in this cycle yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={memoryOpen} onOpenChange={closeCompanyMemory}>
        <DialogContent className="flex h-[min(90dvh,920px)] max-h-[90dvh] w-[min(96vw,72rem)] max-w-none flex-col gap-0 overflow-hidden p-0 sm:max-w-none">
          <div className="shrink-0 border-b border-[var(--brand-ring)] bg-[var(--brand-soft)]/60 px-6 py-5">
            <DialogHeader>
              <DialogTitle className="text-lg text-[var(--brand)]">
                Company memory
              </DialogTitle>
              <DialogDescription className="text-balance text-base leading-relaxed">
                {memoryCompany ? (
                  <>
                    We’ve contacted{" "}
                    <span className="font-medium text-foreground">
                      {memoryCompany}
                    </span>{" "}
                    in other campaigns before. Here’s everyone we’ve reached at
                    this organization and the results so far.
                  </>
                ) : null}
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
            <div className="space-y-2">
              <div className="text-sm font-medium">People in directory</div>
              {peopleAtMemoryCompany.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  No matching contacts in the directory.
                </div>
              ) : (
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {peopleAtMemoryCompany.map((p) => (
                    <li
                      key={p.id}
                      className="flex flex-col rounded-lg border bg-muted/20 px-3 py-2"
                    >
                      <span className="font-medium text-foreground">
                        {p.first_name} {p.last_name}
                      </span>
                      <span className="text-xs font-mono">{p.email}</span>
                      <span className="text-xs">{p.role}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="text-sm font-medium">Outreach history</div>
              {companyHistory.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  No outreach records yet for this company.
                </div>
              ) : (
                <div className="space-y-3">
                  {companyHistory.map(({ record: r, contact: p, cycleMeta }) => (
                    <div
                      key={`${r.id}-${p.id}`}
                      className={`rounded-xl border bg-card p-3 shadow-sm ${
                        r.id === memoryFocusRecordId
                          ? "ring-2 ring-[var(--brand-ring)]"
                          : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-0.5">
                          <div className="text-sm font-medium">
                            {cycleMeta.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {p.first_name} {p.last_name} ·{" "}
                            {formatDate(r.last_contacted_date)} ·{" "}
                            {r.internal_author}
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={statusBadgeClass(r.status)}
                        >
                          {r.status}
                        </Badge>
                      </div>
                      {(r.draft_subject || r.draft_body) && (
                        <div className="mt-2 space-y-1 text-xs">
                          {r.draft_subject && (
                            <div>
                              <span className="text-muted-foreground">
                                Draft subject:{" "}
                              </span>
                              <span className="font-medium">{r.draft_subject}</span>
                            </div>
                          )}
                          {r.draft_body && (
                            <div className="mt-1 whitespace-pre-wrap rounded-md border bg-muted/30 p-2 text-[11px] leading-4">
                              {r.draft_body}
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

          <DialogFooter className="mx-0 mb-0 shrink-0 flex-col gap-4 border-t border-[var(--brand-ring)]/40 bg-gradient-to-t from-muted/55 to-muted/25 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
            <div className="space-y-1.5 sm:max-w-xl">
              <p className="text-sm font-medium text-foreground">
                Draft for this contact?
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Open Hermes and generate a personalized email for the contact you
                selected in the current campaign. You can review and tweak the
                draft before anything is sent.
              </p>
            </div>
            <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row sm:justify-end">
              <Button
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => closeCompanyMemory(false)}
              >
                Not now
              </Button>
              <Button
                className="w-full gap-2 bg-[var(--brand)] text-[var(--brand-foreground)] shadow-sm hover:bg-[var(--brand)]/90 sm:w-auto"
                disabled={!memoryFocusRecordId}
                onClick={generateEmailFromMemory}
              >
                <SparklesIcon className="size-4" />
                Draft with AI
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={draftOpen} onOpenChange={closeDraftModal}>
        <DialogContent className="sm:max-w-3xl p-0 overflow-hidden">
          <div className="p-5">
            <DialogHeader>
              <DialogTitle>Draft with AI</DialogTitle>
              <DialogDescription>
                Write an instruction for the AI. We’ll generate drafts for{" "}
                <span className="text-foreground font-medium">
                  {selected.size}
                </span>{" "}
                selected contact{selected.size === 1 ? "" : "s"}.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-4 grid gap-3">
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder='Example: "Ask for a $1,000 sponsorship and offer a guest speaker slot in October."'
                className="min-h-28 resize-none"
                disabled={isGenerating}
                autoFocus
              />

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div>
                  Tip: keep it short and specific. We’ll personalize with names
                  automatically.
                </div>
                <div>{prompt.length} chars</div>
              </div>
            </div>
          </div>

          <DialogFooter className="sm:items-center">
            <div className="mr-auto flex items-center gap-2 text-xs text-muted-foreground">
              {isGenerating ? (
                <>
                  <Loader2Icon className="size-4 animate-spin" />
                  Generating drafts…
                </>
              ) : generated ? (
                <>
                  <span className="font-medium text-foreground">
                    Drafts ready
                  </span>
                  <span>·</span>
                  <span>{generated.length} email(s)</span>
                </>
              ) : (
                <span>Select rows, then generate drafts.</span>
              )}
            </div>
            <Button
              variant="outline"
              onClick={() => closeDraftModal(false)}
              disabled={isGenerating}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                void handleGenerate()
              }}
              disabled={isGenerating || selectedRows.length === 0}
              className="gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2Icon className="size-4 animate-spin" />
                  Generating…
                </>
              ) : (
                <>
                  <SparklesIcon className="size-4" />
                  Generate drafts
                </>
              )}
            </Button>
          </DialogFooter>

          {generated && (
            <div className="border-t bg-muted/30 p-5 max-h-[50vh] overflow-auto">
              <div className="grid gap-4">
                {generated.map((d) => (
                  <div
                    key={d.recordId}
                    className="rounded-xl border bg-background p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="text-sm font-medium">
                          To: {d.toName}{" "}
                          <span className="text-muted-foreground font-mono text-xs">
                            ({d.toEmail})
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {d.company}
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className="border-purple-500/25 bg-purple-500/15 text-purple-900 dark:text-purple-200"
                      >
                        AI Draft
                      </Badge>
                    </div>

                    <div className="mt-3 space-y-2">
                      <div className="text-xs text-muted-foreground">
                        Subject
                      </div>
                      <div className="rounded-lg border bg-muted/30 px-3 py-2 text-sm">
                        {d.subject}
                      </div>
                    </div>

                    <div className="mt-3 space-y-2">
                      <div className="text-xs text-muted-foreground">Body</div>
                      <div className="whitespace-pre-wrap rounded-lg border bg-muted/30 p-3 text-[13px] leading-5">
                        {d.body}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
