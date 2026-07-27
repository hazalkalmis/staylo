import type { Metadata } from 'next'
import './globals.css'
import CookieConsent from '@/components/CookieConsent'

export const metadata: Metadata = {
  title: 'Staylo — One search. Every hotel. No guessing.',
  description: 'AI-powered hotel search across Booking.com. Honest rankings, transparent scoring, no commission.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <CookieConsent />
      </body>
    </html>
  )
}