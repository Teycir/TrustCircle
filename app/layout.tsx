import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'TrustCircle Lite',
  description: 'Privacy-first secure data sharing with time and location locks',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
