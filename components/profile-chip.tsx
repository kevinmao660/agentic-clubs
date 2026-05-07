"use client"

import Link from "next/link"
import { signOut, useSession } from "next-auth/react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

function initialsFrom(name: string | null | undefined, email: string | null | undefined) {
  const n = name?.trim()
  if (n) {
    const parts = n.split(/\s+/).filter(Boolean)
    if (parts.length >= 2) {
      return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase()
    }
    return (parts[0]?.slice(0, 2) ?? "?").toUpperCase()
  }
  const local = email?.split("@")[0]
  return (local?.slice(0, 2) ?? "?").toUpperCase()
}

export function ProfileChip() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return (
      <div
        className="h-9 w-24 animate-pulse rounded-full bg-muted"
        aria-hidden
      />
    )
  }

  if (!session?.user) {
    return (
      <Link
        href="/login"
        className={cn(buttonVariants({ variant: "outline", size: "sm" }), "rounded-full")}
      >
        Sign in
      </Link>
    )
  }

  const { user } = session
  const display = user.name ?? user.email ?? "Account"
  const initials = initialsFrom(user.name, user.email)

  return (
    <div className="flex items-center gap-1">
      <div className="flex h-9 items-center gap-2 rounded-full border border-transparent px-2 pr-3">
        <Avatar className="size-7">
          <AvatarImage src={user.image ?? undefined} alt="" />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <span className="max-w-[10rem] truncate text-sm font-medium">
          {display}
        </span>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="rounded-full text-muted-foreground"
        type="button"
        onClick={() => signOut({ callbackUrl: "/" })}
      >
        Sign out
      </Button>
    </div>
  )
}
