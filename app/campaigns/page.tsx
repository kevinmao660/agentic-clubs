"use client"

import Link from "next/link"

import { useCampaign } from "@/components/campaign-context"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function CampaignsPage() {
  const {
    campaigns,
    setCampaignId,
    campaignId,
    getRecordCountForCampaign,
    organization,
  } = useCampaign()

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Campaigns</h1>
        <p className="text-muted-foreground">
          Time-bound outreach campaigns. Open one in Outreach to work its
          pipeline.
        </p>
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
            {campaigns.map((c) => {
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
                      href={`/outreach?cycle=${encodeURIComponent(c.id)}`}
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
            })}
          </TableBody>
        </Table>
      </div>

      <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
        <span className="font-medium text-foreground">Organization: </span>
        {organization.name}
        <span className="mx-2 text-muted-foreground">·</span>
        <span className="line-clamp-2">{organization.generalFacts}</span>
      </div>
    </div>
  )
}
