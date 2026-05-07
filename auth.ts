import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { NextResponse } from "next/server"

const gmailReadonly = "https://www.googleapis.com/auth/gmail.readonly"
const gmailSend = "https://www.googleapis.com/auth/gmail.send"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope: [
            "openid",
            "https://www.googleapis.com/auth/userinfo.email",
            "https://www.googleapis.com/auth/userinfo.profile",
            gmailReadonly,
            gmailSend,
          ].join(" "),
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account?.access_token) {
        token.access_token = account.access_token
        if (account.refresh_token) {
          token.refresh_token = account.refresh_token
        }
        const now = Math.floor(Date.now() / 1000)
        const expiresIn =
          typeof account.expires_in === "number" ? account.expires_in : 3600
        token.expires_at = now + expiresIn
      }
      return token
    },
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub
      }
      return session
    },
    authorized({ request, auth }) {
      const { pathname } = request.nextUrl
      const isProtected =
        pathname.startsWith("/contacts") || pathname.startsWith("/outreach")

      if (!isProtected) {
        return true
      }

      if (auth?.user) {
        return true
      }

      const login = new URL("/login", request.nextUrl.origin)
      login.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(login)
    },
  },
})
