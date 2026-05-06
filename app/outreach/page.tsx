import { Suspense } from "react"

import { OutreachClient } from "./outreach-client"

export default function OutreachPage() {
  return (
    <Suspense
      fallback={
        <div className="text-sm text-muted-foreground">Loading outreach…</div>
      }
    >
      <OutreachClient />
    </Suspense>
  )
}
