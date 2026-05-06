"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

export function ProfileChip() {
  // Mocked until auth/user profile is wired up
  const name = "Kevin"
  const initials = "K"

  return (
    <Button
      variant="ghost"
      className="h-9 gap-2 rounded-full px-2 pr-3"
      type="button"
    >
      <Avatar className="size-7">
        <AvatarImage src="/avatar.png" alt={`${name} profile`} />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <span className="text-sm font-medium">{name}</span>
    </Button>
  )
}

