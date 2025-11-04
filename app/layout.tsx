import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ConfigLoader } from '@/components/ConfigLoader'
import { CacheProvider } from '@/lib/cache'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'TrustCircle',
  description: 'Privacy-first secure data sharing',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <CacheProvider>
          <ConfigLoader />
          {children}
        </CacheProvider>
      </body>
    </html>
  )
}
