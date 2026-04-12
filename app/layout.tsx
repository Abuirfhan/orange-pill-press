import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Orange Pill Press',
  description: 'Sound money for an unsound world. Bitcoin & macro analysis.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}