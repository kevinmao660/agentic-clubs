import { getToken } from "next-auth/jwt"
import { NextResponse } from "next/server"

import { auth } from "@/auth"
import { sendPlaintextEmail } from "@/lib/gmail-send"
import { createServiceSupabase } from "@/lib/supabase-admin"

export const maxDuration = 120

const MAX_IDS = 50

type RequestBody = {
  recordIds?: string[]
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const secret = process.env.AUTH_SECRET
  if (!secret) {
    return NextResponse.json(
      { error: "Server misconfiguration: AUTH_SECRET." },
      { status: 500 }
    )
  }

  const jwt = await getToken({
    req: request,
    secret,
  })

  const accessToken =
    typeof jwt?.access_token === "string" ? jwt.access_token : null
  const refreshToken =
    typeof jwt?.refresh_token === "string" ? jwt.refresh_token : undefined

  if (!accessToken) {
    return NextResponse.json(
      {
        error:
          "No Google access token. Sign out and sign in again so Hermes can send mail with your Gmail account.",
      },
      { status: 401 }
    )
  }

  let body: RequestBody
  try {
    body = (await request.json()) as RequestBody
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const rawIds = Array.isArray(body.recordIds) ? body.recordIds : []
  const recordIds = [...new Set(rawIds.map((id) => String(id).trim()))].filter(
    Boolean
  )

  if (recordIds.length === 0) {
    return NextResponse.json(
      { error: "recordIds must be a non-empty array." },
      { status: 400 }
    )
  }

  if (recordIds.length > MAX_IDS) {
    return NextResponse.json(
      { error: `Too many records (max ${MAX_IDS}).` },
      { status: 400 }
    )
  }

  const supabase = createServiceSupabase()

  const { data: rows, error: rowErr } = await supabase
    .from("outreach_records")
    .select("id, contact_id, draft_subject, draft_body, status")
    .in("id", recordIds)

  if (rowErr) {
    console.error("[send-emails] outreach_records", rowErr)
    return NextResponse.json(
      { error: "Could not load outreach records." },
      { status: 500 }
    )
  }

  const byId = new Map((rows ?? []).map((r) => [String(r.id), r]))
  const missing = recordIds.filter((id) => !byId.has(id))
  if (missing.length > 0) {
    return NextResponse.json(
      { error: `Unknown record id(s): ${missing.slice(0, 5).join(", ")}` },
      { status: 400 }
    )
  }

  const contactIds = [...new Set((rows ?? []).map((r) => String(r.contact_id)))]
  const { data: contacts, error: cErr } = await supabase
    .from("contacts")
    .select("id, email")
    .in("id", contactIds)

  if (cErr || !contacts) {
    console.error("[send-emails] contacts", cErr)
    return NextResponse.json(
      { error: "Could not load contacts." },
      { status: 500 }
    )
  }

  const emailByContactId = Object.fromEntries(
    contacts.map((c) => [String(c.id), String(c.email)])
  )

  const results: {
    recordId: string
    ok: boolean
    error?: string
  }[] = []

  for (const recordId of recordIds) {
    const row = byId.get(recordId)!
    const draftBody =
      row.draft_body === null || row.draft_body === undefined
        ? ""
        : String(row.draft_body).trim()
    const draftSubject =
      row.draft_subject === null || row.draft_subject === undefined
        ? ""
        : String(row.draft_subject).trim()

    if (!draftBody) {
      results.push({
        recordId,
        ok: false,
        error: "Missing draft body.",
      })
      continue
    }

    const to = emailByContactId[String(row.contact_id)]
    if (!to?.includes("@")) {
      results.push({
        recordId,
        ok: false,
        error: "Invalid contact email.",
      })
      continue
    }

    const subject =
      draftSubject ||
      "Partnership outreach"

    try {
      await sendPlaintextEmail({
        accessToken,
        refreshToken,
        to,
        subject,
        body: draftBody,
      })
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : "Gmail API error."
      console.error("[send-emails] gmail", recordId, e)
      results.push({ recordId, ok: false, error: msg })
      continue
    }

    const now = new Date().toISOString()
    const { error: upErr } = await supabase
      .from("outreach_records")
      .update({
        draft_subject: null,
        draft_body: null,
        status: "Outreaching",
        last_contacted_date: now,
      })
      .eq("id", recordId)

    if (upErr) {
      console.error("[send-emails] update", recordId, upErr)
      results.push({
        recordId,
        ok: false,
        error: "Sent via Gmail but failed to update database.",
      })
      continue
    }

    results.push({ recordId, ok: true })
  }

  const failed = results.filter((r) => !r.ok)
  const sent = results.filter((r) => r.ok).length

  return NextResponse.json({
    sent,
    failed: failed.length,
    results,
  })
}
