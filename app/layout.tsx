import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Free Notion Invoice Generator | PaidInBlocks',
  description: 'The fastest way for freelancers to turn Notion pages into professional invoices.',
  openGraph: {
    title: 'Free Notion Invoice Generator | PaidInBlocks',
    description: 'The fastest way for freelancers to turn Notion pages into professional invoices.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}


