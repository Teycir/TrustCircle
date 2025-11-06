import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ConfigLoader } from '@/components/ConfigLoader'
import { CacheProvider } from '@/lib/cache'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import StorageStatusProvider from '@/components/StorageStatusProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'TrustCircle - Privacy-First Secure Data Sharing',
    template: '%s | TrustCircle',
  },
  description: 'Privacy-first secure data sharing with time and location-based unlocking. End-to-end encryption with IPFS storage. Create time capsules, store professional documents, and share files securely.',
  applicationName: 'TrustCircle',
  keywords: [
    'encryption',
    'secure file sharing',
    'privacy',
    'IPFS',
    'time lock',
    'vault',
    'dead hand protocol',
    'end-to-end encryption',
    'decentralized storage',
    'time capsule',
    'document verification',
    'cryptographic proof',
    'AES-256-GCM',
    'location-based access',
  ],
  authors: [{ name: 'TrustCircle', url: 'https://thetrustcircle.vercel.app' }],
  creator: 'TrustCircle',
  publisher: 'TrustCircle',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://thetrustcircle.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'TrustCircle - Privacy-First Secure Data Sharing',
    description: 'End-to-end encrypted file sharing with time and location-based unlocking. Store documents securely with cryptographic proof.',
    url: 'https://thetrustcircle.vercel.app',
    siteName: 'TrustCircle',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/icon.svg',
        width: 1200,
        height: 630,
        alt: 'TrustCircle - Secure Data Sharing',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TrustCircle - Privacy-First Secure Data Sharing',
    description: 'End-to-end encrypted file sharing with time and location-based unlocking',
    images: ['/icon.svg'],
    creator: '@trustcircle',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
  manifest: '/manifest.json',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#6366f1' },
    { media: '(prefers-color-scheme: dark)', color: '#4f46e5' },
  ],
  category: 'technology',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ErrorBoundary>
          <CacheProvider>
            <ConfigLoader />
            <StorageStatusProvider />
            {children}
          </CacheProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
