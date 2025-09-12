import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Agentic Clubs - AI-Powered Sponsorship Outreach',
  description: 'Streamline your student club sponsorship outreach with AI-powered document processing, company discovery, and personalized email generation.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}