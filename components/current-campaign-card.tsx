"use client"

import { usePathname } from "next/navigation"

import { useCampaign } from "@/components/campaign-context"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"

function clamp(text: string, maxChars: number) {
  if (text.length <= maxChars) return text
  return `${text.slice(0, maxChars - 1).trimEnd()}…`
}

function splitKeyStats(keyStats: string) {
  const raw = keyStats
    .replace(/\n+/g, " • ")
    .split(/•|\n/)
    .map((s) => s.trim())
    .filter(Boolean)

  return raw.length > 0 ? raw : [keyStats.trim()].filter(Boolean)
}

export function CurrentCampaignCard() {
  const pathname = usePathname()
  const {
    campaignId,
    campaigns,
    updateCampaign,
    getRecordCountForCampaign,
    organization,
    updateOrganization,
  } = useCampaign()

  const cycle = campaigns.find((c) => c.id === campaignId) ?? campaigns[0] ?? null

  const stats = splitKeyStats(organization.keyStats).slice(0, 12)
  const recordCount = cycle ? getRecordCountForCampaign(cycle.id) : 0
  const isEditing = pathname === "/campaigns"

  return (
    <Card className="sticky top-20" size="sm">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between gap-3">
          <CardTitle>Current campaign</CardTitle>
          <Badge
            variant="outline"
            className="border-[var(--brand-ring)] bg-[var(--brand-soft)] text-[var(--brand)]"
          >
            Hermes
          </Badge>
        </div>
        <CardDescription className="space-y-2">
          <div className="font-medium text-foreground">{cycle?.name ?? "—"}</div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {cycle?.is_active ? (
              <Badge variant="secondary" className="text-[10px]">
                Active
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[10px]">
                Archived
              </Badge>
            )}
            <span className="text-muted-foreground">
              {cycle
                ? `Started ${new Date(cycle.created_at).toLocaleDateString()}`
                : null}
            </span>
            <span className="text-muted-foreground">
              {recordCount} record{recordCount === 1 ? "" : "s"}
            </span>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditing && cycle ? (
          <div className="space-y-3">
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Campaign name</div>
              <Input
                value={cycle.name}
                onChange={(e) => updateCampaign(cycle.id, { name: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Campaign ask</div>
              <Textarea
                value={cycle.ask}
                onChange={(e) => updateCampaign(cycle.id, { ask: e.target.value })}
                className="min-h-28 resize-none"
              />
              <div className="text-xs text-muted-foreground">
                What you’re asking for in this campaign (sponsorship tier, speaker
                slot, etc.).
              </div>
            </div>
          </div>
        ) : cycle ? (
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Campaign ask</div>
            <div className="rounded-lg border bg-muted/30 p-3 text-sm leading-6">
              {clamp(cycle.ask, 280)}
            </div>
          </div>
        ) : null}

        <Separator />

        <div className="space-y-1">
          <div className="text-xs font-medium text-foreground">Organization</div>
          <p className="text-xs text-muted-foreground">
            Club-wide context. Key stats are for the organization overall.
          </p>
        </div>

        {isEditing ? (
          <div className="space-y-3">
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Organization name</div>
              <Input
                value={organization.name}
                onChange={(e) => updateOrganization({ name: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">General facts</div>
              <Textarea
                value={organization.generalFacts}
                onChange={(e) =>
                  updateOrganization({ generalFacts: e.target.value })
                }
                className="min-h-28 resize-none"
                placeholder="Mission, what you do, audience, notable programs…"
              />
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Key stats</div>
              <Textarea
                value={organization.keyStats}
                onChange={(e) => updateOrganization({ keyStats: e.target.value })}
                className="min-h-24 resize-none font-mono text-xs"
                placeholder="One per line, or separate with •  (e.g. 150+ members • 18 workshops/semester)"
              />
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Organization name</div>
              <div className="text-sm font-medium">{organization.name}</div>
            </div>

            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">General facts</div>
              <div className="rounded-lg border bg-muted/30 p-3 text-sm leading-6 whitespace-pre-wrap">
                {organization.generalFacts}
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Key stats</div>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {stats.map((s) => (
                  <li key={s} className="flex gap-2">
                    <span className="mt-1 size-1.5 shrink-0 rounded-full bg-foreground/20" />
                    <span>{clamp(s, 120)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
