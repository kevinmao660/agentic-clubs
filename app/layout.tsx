import type { Metadata } from "next"
import { Inter, Geist_Mono } from "next/font/google"
import Link from "next/link"
import "./globals.css";

import { CampaignProvider } from "@/components/campaign-context"
import { TopNav } from "@/components/top-nav"
import { CurrentCampaignCard } from "@/components/current-campaign-card"
import { ProfileChip } from "@/components/profile-chip"

const fontSans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hermes",
  description: "Hermes — AI-assisted outreach for student organizations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fontSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
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
          <CampaignProvider>
            <div className="mx-auto w-full max-w-7xl px-4 py-8">
              <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
                <aside className="hidden lg:block">
                  <CurrentCampaignCard />
                </aside>
                <div className="min-w-0">{children}</div>
              </div>
            </div>
          </CampaignProvider>
        </main>
      </body>
    </html>
  );
}
