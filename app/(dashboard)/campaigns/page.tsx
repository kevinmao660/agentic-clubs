"use client"

import * as React from "react"
import Link from "next/link"

import { useCampaign } from "@/components/campaign-context"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { MegaphoneIcon } from "lucide-react"

export default function CampaignsPage() {
  const {
    campaigns,
    setCampaignId,
    campaignId,
    getRecordCountForCampaign,
    organization,
    createCampaign,
  } = useCampaign()

  const [createOpen, setCreateOpen] = React.useState(false)
  const [name, setName] = React.useState("")
  const [makeActive, setMakeActive] = React.useState(true)
  const [creating, setCreating] = React.useState(false)

  async function handleCreateCampaign(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setCreating(true)
    const c = await createCampaign({ name: name.trim(), makeActive })
    setCreating(false)
    if (c) {
      setCreateOpen(false)
      setName("")
      setMakeActive(true)
      setCampaignId(c.id)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Campaigns</h1>
          <p className="text-muted-foreground">
            Time-bound outreach campaigns. Each campaign has its own pipeline on
            Outreach — contacts can be added or moved between campaigns from the
            Contacts page.
          </p>
        </div>
        <Button
          type="button"
          className="shrink-0 gap-2 bg-[var(--brand)] text-[var(--brand-foreground)] hover:bg-[var(--brand)]/90"
          onClick={() => setCreateOpen(true)}
        >
          <MegaphoneIcon className="size-4" />
          New campaign
        </Button>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Campaign</TableHead>
              <TableHead className="w-[120px]">Status</TableHead>
              <TableHead className="w-[140px] text-right">Records</TableHead>
              <TableHead className="w-[200px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {campaigns.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-28 text-center text-muted-foreground">
                  No campaigns yet. Create one to start outreach.
                </TableCell>
              </TableRow>
            ) : (
              campaigns.map((c) => {
                const count = getRecordCountForCampaign(c.id)
                const isSelected = c.id === campaignId
                return (
                  <TableRow
                    key={c.id}
                    className={isSelected ? "bg-muted/40" : "cursor-pointer"}
                    onClick={() => setCampaignId(c.id)}
                  >
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{c.name}</div>
                        <div className="text-xs text-muted-foreground font-mono">
                          {c.id}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {c.is_active ? (
                        <Badge variant="secondary">Active</Badge>
                      ) : (
                        <Badge variant="outline">Archived</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">
                      {count}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/outreach?campaign=${encodeURIComponent(c.id)}`}
                        className={buttonVariants({
                          variant: "outline",
                          size: "sm",
                        })}
                        onClick={(e) => e.stopPropagation()}
                      >
                        Open in Outreach
                      </Link>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
        <span className="font-medium text-foreground">Organization: </span>
        {organization.name}
        <span className="mx-2 text-muted-foreground">·</span>
        <span className="line-clamp-2">{organization.generalFacts}</span>
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleCreateCampaign}>
            <DialogHeader>
              <DialogTitle>New campaign</DialogTitle>
              <DialogDescription>
                Pipeline rows on Outreach are scoped to one campaign at a time.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-1.5">
                <div className="text-xs text-muted-foreground">Campaign name</div>
                <Input
                  required
                  placeholder='e.g. Fall 2026 Sponsorships'
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                />
              </div>
              <label className="flex cursor-pointer items-start gap-3 rounded-lg border bg-muted/30 p-3">
                <Checkbox
                  checked={makeActive}
                  onCheckedChange={(v) => setMakeActive(Boolean(v))}
                  className="mt-0.5"
                />
                <div>
                  <div className="text-sm font-medium">Set as active campaign</div>
                  <div className="text-xs text-muted-foreground">
                    Only one campaign is active at a time; others stay archived.
                  </div>
                </div>
              </label>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={creating}>
                {creating ? "Creating…" : "Create campaign"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
