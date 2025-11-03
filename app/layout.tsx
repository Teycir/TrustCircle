import './globals.css'
import type { Metadata } from 'next'
import OfflineIndicator from '@/components/OfflineIndicator'
import SyncManager from '@/components/SyncManager'

export const metadata: Metadata = {
  title: 'TrustCircle',
  description: 'Privacy-first secure data sharing with time and location locks',
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🔐</text></svg>',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <OfflineIndicator />
        <SyncManager />
        {children}
      </body>
    </html>
  )
}
