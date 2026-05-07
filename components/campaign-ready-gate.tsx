"use client"

import { useCampaign } from "@/components/campaign-context"

export function CampaignReadyGate({ children }: { children: React.ReactNode }) {
  const { ready } = useCampaign()

  if (!ready) {
    return (
      <div className="text-sm text-muted-foreground">Loading workspace…</div>
    )
  }

  return children
}
