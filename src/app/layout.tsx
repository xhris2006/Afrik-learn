// src/app/layout.tsx
import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'
import './globals.css'

export const metadata: Metadata = {
  title: { default: 'AfrikLearn', template: '%s | AfrikLearn' },
  description: 'The #1 student platform for African universities. Access course materials, past papers, and connect with students.',
  keywords: ['education', 'university', 'Cameroon', 'Africa', 'students', 'past papers', 'courses'],
  authors: [{ name: 'AfrikLearn' }],
  openGraph: {
    type: 'website',
    locale: 'en_CM',
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: 'AfrikLearn',
    title: 'AfrikLearn — Study Smarter. Together.',
    description: 'Access course materials, past papers, and connect with students across African universities.',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              borderRadius: '12px',
              background: '#fff',
              color: '#0F172A',
              boxShadow: '0 4px 24px rgba(21,101,192,0.12)',
              fontSize: '14px',
              fontWeight: '500',
            },
            success: { iconTheme: { primary: '#1565C0', secondary: '#fff' } },
            error: { iconTheme: { primary: '#EF4444', secondary: '#fff' } },
            duration: 4000,
          }}
        />
      </body>
    </html>
  )
}
