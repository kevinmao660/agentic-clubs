"use client"

import { signIn } from "next-auth/react"

import { Button } from "@/components/ui/button"

export function LoginButton({ callbackUrl }: { callbackUrl: string }) {
  return (
    <Button
      type="button"
      size="lg"
      className="w-full rounded-full"
      onClick={() => signIn("google", { callbackUrl })}
    >
      Continue with Google
    </Button>
  )
}
