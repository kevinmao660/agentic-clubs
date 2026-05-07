import { google } from "googleapis"

function encodeSubject(subject: string): string {
  if (/^[\x00-\x7F]*$/.test(subject)) return subject
  return `=?UTF-8?B?${Buffer.from(subject, "utf8").toString("base64")}?=`
}

/** RFC 2822 message with CRLF; UTF-8 body and encoded subject when needed. */
export function buildRfc822Message(opts: {
  to: string
  subject: string
  body: string
}): string {
  const normalizedBody = opts.body.replace(/\r\n/g, "\n").replace(/\r/g, "\n")
  const lines = [
    `To: ${opts.to}`,
    `Subject: ${encodeSubject(opts.subject)}`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: 8bit",
    "",
    normalizedBody,
  ]
  return lines.join("\r\n").replace(/\n/g, "\r\n")
}

/** Gmail API `raw` format: web-safe base64 without padding. */
export function rfc822ToGmailRaw(rfc822: string): string {
  return Buffer.from(rfc822, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "")
}

export function createGmailClient(accessToken: string, refreshToken?: string) {
  const clientId = process.env.AUTH_GOOGLE_ID
  const clientSecret = process.env.AUTH_GOOGLE_SECRET
  if (!clientId || !clientSecret) {
    throw new Error("Missing AUTH_GOOGLE_ID or AUTH_GOOGLE_SECRET.")
  }

  const oauth2 = new google.auth.OAuth2(clientId, clientSecret)
  oauth2.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  })

  return google.gmail({ version: "v1", auth: oauth2 })
}

export async function sendPlaintextEmail(opts: {
  accessToken: string
  refreshToken?: string
  to: string
  subject: string
  body: string
}) {
  const gmail = createGmailClient(opts.accessToken, opts.refreshToken)
  const rfc822 = buildRfc822Message({
    to: opts.to,
    subject: opts.subject,
    body: opts.body,
  })

  await gmail.users.messages.send({
    userId: "me",
    requestBody: {
      raw: rfc822ToGmailRaw(rfc822),
    },
  })
}
