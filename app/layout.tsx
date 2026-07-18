import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/contexts/theme-context'
import { LanguageProvider } from '@/components/contexts/language-context'
import { AuthProvider } from '@/components/contexts/auth-context'
import { ServiceWorkerRegister } from '@/components/service-worker-register'

export const metadata: Metadata = {
  title: 'MSME Inventory Manager',
  description: 'Manage your business inventory efficiently',
  generator: 'v0.app',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'MSME Inventory Manager',
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
  width: 'device-width',
  initialScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="white" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="black" media="(prefers-color-scheme: dark)" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <script dangerouslySetInnerHTML={{
          __html: `
            try {
              const theme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
              document.documentElement.classList.add(theme);
            } catch (e) {}
          `
        }} />
      </head>
      <body className="antialiased bg-background text-foreground" suppressHydrationWarning>
        <ServiceWorkerRegister />
        <AuthProvider>
          <LanguageProvider>
            <ThemeProvider>
              {children}
              {process.env.NODE_ENV === 'production' && <Analytics />}
            </ThemeProvider>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
