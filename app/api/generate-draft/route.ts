import Anthropic from "@anthropic-ai/sdk"
import { NextResponse } from "next/server"

import { auth } from "@/auth"
import type { WorkspaceProfileRow } from "@/lib/crm-types"
import { createServiceSupabase } from "@/lib/supabase-admin"

export const maxDuration = 120

type ContactPayload = {
  id: string
  first_name: string
  last_name: string
  email: string
  company: string
  role: string
}

type ItemPayload = {
  outreachRecordId: string
  contact: ContactPayload
  /** Optional company-level outreach history summary from the client. */
  historicalContext?: string
}

type RequestBody = {
  instruction: string
  internalAuthor: string
  items: ItemPayload[]
}

type DraftResult = {
  recordId: string
  toName: string
  toEmail: string
  company: string
  subject: string
  body: string
}

function buildSystemPrompt(wp: WorkspaceProfileRow): string {
  return [
    `You draft outreach emails for ${wp.organization_name}.`,
    ``,
    `Workspace context (use to stay on-brand; adapt tone to each recipient):`,
    `- Mission: ${wp.mission_statement}`,
    `- Key stats: ${wp.key_stats}`,
    `- Default pitch / current ask: ${wp.current_ask}`,
    ``,
    `Rules:`,
    `- Write exactly one email: a subject line and a plain-text body suitable for a student organization reaching out to external contacts.`,
    `- Be concise, warm, and professional. Personalize using the contact and company information provided.`,
    `- If prior outreach context is included, do not contradict it; acknowledge continuity when appropriate.`,
    `- Respond with ONLY valid JSON (no markdown fences, no commentary) with exactly these keys: "subject" and "body". Both values must be strings.`,
    `- The "body" must be ready to send as plain text (no placeholder tokens like {{First_Name}}).`,
  ].join("\n")
}

function parseEmailJson(raw: string): { subject: string; body: string } {
  const stripped = raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim()
  const parsed: unknown = JSON.parse(stripped)
  if (
    typeof parsed !== "object" ||
    parsed === null ||
    !("subject" in parsed) ||
    !("body" in parsed)
  ) {
    throw new Error("Model response is not a JSON object with subject and body.")
  }
  const rec = parsed as { subject: unknown; body: unknown }
  if (typeof rec.subject !== "string" || typeof rec.body !== "string") {
    throw new Error("subject and body must be strings.")
  }
  return { subject: rec.subject.trim(), body: rec.body.trim() }
}

async function generateOneDraft(args: {
  anthropic: Anthropic
  model: string
  system: string
  instruction: string
  contact: ContactPayload
  historicalContext?: string
}): Promise<{ subject: string; body: string }> {
  const { anthropic, model, system, instruction, contact, historicalContext } =
    args

  const userParts = [
    `User instruction:\n${instruction || "Write a thoughtful partnership outreach email."}`,
    ``,
    `Contact:`,
    `- Name: ${contact.first_name} ${contact.last_name}`,
    `- Email: ${contact.email}`,
    `- Company: ${contact.company}`,
    `- Role: ${contact.role}`,
  ]
  if (historicalContext?.trim()) {
    userParts.push(
      ``,
      `Prior outreach for this company (for continuity; do not invent facts beyond this):`,
      historicalContext.trim()
    )
  }
  userParts.push(``, `Return only the JSON object with "subject" and "body".`)

  const message = await anthropic.messages.create({
    model,
    max_tokens: 2048,
    system,
    messages: [{ role: "user", content: userParts.join("\n") }],
  })

  const block = message.content[0]
  if (!block || block.type !== "text") {
    throw new Error("Unexpected response from language model.")
  }

  return parseEmailJson(block.text)
}

const DEFAULT_MODEL = "claude-3-5-haiku-20241022"
const MAX_ITEMS = 25

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey?.trim()) {
    return NextResponse.json(
      { error: "Server is missing ANTHROPIC_API_KEY." },
      { status: 500 }
    )
  }

  let body: RequestBody
  try {
    body = (await request.json()) as RequestBody
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const instruction = typeof body.instruction === "string" ? body.instruction : ""
  const internalAuthor =
    typeof body.internalAuthor === "string" ? body.internalAuthor.trim() : ""
  const items = Array.isArray(body.items) ? body.items : []

  if (!internalAuthor) {
    return NextResponse.json(
      { error: "internalAuthor is required (your name for the draft queue)." },
      { status: 400 }
    )
  }

  if (items.length === 0) {
    return NextResponse.json(
      { error: "At least one contact item is required." },
      { status: 400 }
    )
  }

  if (items.length > MAX_ITEMS) {
    return NextResponse.json(
      { error: `Too many contacts (max ${MAX_ITEMS}).` },
      { status: 400 }
    )
  }

  for (const it of items) {
    if (!it.outreachRecordId || !it.contact?.id) {
      return NextResponse.json(
        { error: "Each item needs outreachRecordId and contact." },
        { status: 400 }
      )
    }
  }

  const supabase = createServiceSupabase()
  const wpRes = await supabase
    .from("workspace_profile")
    .select("*")
    .limit(1)
    .maybeSingle()

  if (wpRes.error) {
    console.error("[generate-draft] workspace_profile", wpRes.error)
    return NextResponse.json(
      { error: "Could not load workspace profile from Supabase." },
      { status: 500 }
    )
  }

  const wp = wpRes.data as WorkspaceProfileRow | null
  if (!wp) {
    return NextResponse.json(
      {
        error:
          "No workspace profile found. Complete organization settings in the app first.",
      },
      { status: 400 }
    )
  }

  const system = buildSystemPrompt(wp)
  const model = process.env.ANTHROPIC_MODEL?.trim() || DEFAULT_MODEL
  const anthropic = new Anthropic({ apiKey })

  const drafts: DraftResult[] = []
  const concurrency = 3

  try {
    for (let i = 0; i < items.length; i += concurrency) {
      const chunk = items.slice(i, i + concurrency)
      const chunkResults = await Promise.all(
        chunk.map(async (item) => {
          const { subject, body: emailBody } = await generateOneDraft({
            anthropic,
            model,
            system,
            instruction,
            contact: item.contact,
            historicalContext: item.historicalContext,
          })

          const { error: upErr } = await supabase
            .from("outreach_records")
            .update({
              draft_subject: subject,
              draft_body: emailBody,
              internal_author: internalAuthor,
              status: "Needs Review",
            })
            .eq("id", item.outreachRecordId)

          if (upErr) {
            console.error("[generate-draft] update outreach_records", upErr)
            throw new Error(upErr.message)
          }

          const c = item.contact
          return {
            recordId: item.outreachRecordId,
            toName: `${c.first_name} ${c.last_name}`.trim(),
            toEmail: c.email,
            company: c.company,
            subject,
            body: emailBody,
          } satisfies DraftResult
        })
      )
      drafts.push(...chunkResults)
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : "Generation failed."
    return NextResponse.json({ error: message }, { status: 500 })
  }

  return NextResponse.json({ drafts })
}
