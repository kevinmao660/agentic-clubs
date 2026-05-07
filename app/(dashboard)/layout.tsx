import Link from "next/link"

import { auth } from "@/auth"
import { CampaignProvider } from "@/components/campaign-context"
import { CampaignReadyGate } from "@/components/campaign-ready-gate"
import { CurrentCampaignCard } from "@/components/current-campaign-card"
import { ProfileChip } from "@/components/profile-chip"
import { TopNav } from "@/components/top-nav"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  const userId = session?.user?.id ?? null

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-[var(--brand-ring)] bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between px-4">
          <Link
            href="/outreach"
            className="group flex items-center gap-2 font-semibold tracking-tight text-foreground"
          >
            <span
              aria-hidden
              className="flex size-8 items-center justify-center rounded-lg bg-[var(--brand-soft)] text-sm font-bold text-[var(--brand)] ring-1 ring-[var(--brand-ring)] transition-colors group-hover:bg-[var(--brand)] group-hover:text-[var(--brand-foreground)] group-hover:ring-transparent"
            >
              H
            </span>
            Hermes
          </Link>
          <div className="flex items-center gap-2">
            <TopNav />
            <ProfileChip />
          </div>
        </div>
      </header>
      <main className="flex flex-1">
        <CampaignProvider userId={userId}>
          <CampaignReadyGate>
            <div className="mx-auto w-full max-w-7xl px-4 py-8">
              <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
                <aside className="hidden lg:block">
                  <CurrentCampaignCard />
                </aside>
                <div className="min-w-0">{children}</div>
              </div>
            </div>
          </CampaignReadyGate>
        </CampaignProvider>
      </main>
    </>
  )
}
