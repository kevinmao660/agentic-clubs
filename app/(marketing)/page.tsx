import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function HomePage() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-0px)] w-full max-w-3xl flex-col justify-center px-4 py-16">
      <p className="text-sm font-medium text-[var(--brand)]">Hermes</p>
      <h1 className="mt-3 text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
        Outreach that feels personal, at club scale
      </h1>
      <p className="mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
        Hermes helps student orgs run structured sponsorship and partnership
        campaigns: keep contacts organized, draft thoughtful emails with context
        from your club, and track every conversation in one workspace—without
        losing the human touch.
      </p>
      <ul className="mt-8 space-y-3 text-muted-foreground">
        <li className="flex gap-3">
          <span
            className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[var(--brand)]"
            aria-hidden
          />
          <span>
            <strong className="font-medium text-foreground">
              Campaigns
            </strong>{" "}
            — scope each push (Fall sponsors, spring partners) and stay aligned
            as a team.
          </span>
        </li>
        <li className="flex gap-3">
          <span
            className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[var(--brand)]"
            aria-hidden
          />
          <span>
            <strong className="font-medium text-foreground">
              Contact memory
            </strong>{" "}
            — see past outreach per company so drafts stay consistent and
            respectful.
          </span>
        </li>
        <li className="flex gap-3">
          <span
            className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[var(--brand)]"
            aria-hidden
          />
          <span>
            <strong className="font-medium text-foreground">
              Gmail-ready
            </strong>{" "}
            — sign in with Google so Hermes can read thread context and send
            mail when you are ready (scopes are explicit and reviewable at
            login).
          </span>
        </li>
      </ul>
      <div className="mt-10 flex flex-wrap items-center gap-3">
        <Link
          href="/login"
          className={cn(buttonVariants({ size: "lg" }), "rounded-full px-8")}
        >
          Sign in to continue
        </Link>
        <p className="text-sm text-muted-foreground">
          New here? You&apos;ll connect Google and land in your workspace.
        </p>
      </div>
    </div>
  )
}
