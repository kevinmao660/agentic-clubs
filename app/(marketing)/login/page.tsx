import Link from "next/link"

import { LoginButton } from "./login-button"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>
}) {
  const { callbackUrl } = await searchParams
  const safeCallback =
    callbackUrl?.startsWith("/") && !callbackUrl.startsWith("//")
      ? callbackUrl
      : "/outreach"

  return (
    <div className="mx-auto flex min-h-[calc(100vh-0px)] w-full max-w-md flex-col justify-center px-4 py-16">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-2 text-sm font-semibold tracking-tight text-foreground"
      >
        <span
          aria-hidden
          className="flex size-8 items-center justify-center rounded-lg bg-[var(--brand-soft)] text-sm font-bold text-[var(--brand)] ring-1 ring-[var(--brand-ring)]"
        >
          H
        </span>
        Hermes
      </Link>
      <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Use your Google account. We request Gmail read-only and send access so
        Hermes can help with drafting and sending when you choose.
      </p>
      <div className="mt-8">
        <LoginButton callbackUrl={safeCallback} />
      </div>
      <Link
        href="/"
        className={cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          "mt-8 self-start rounded-full px-0 text-muted-foreground"
        )}
      >
        ← Back to home
      </Link>
    </div>
  )
}
