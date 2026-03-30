import type { Metadata, Viewport } from 'next';
import './globals.css';
import { I18nProvider } from '@/lib/i18n';
import { AuthProvider } from '@/lib/auth-context';

export const metadata: Metadata = {
  title:       'Legal Eagle — Legal Accountability Platform',
  description: 'AI-powered legal case management with real-time transparency, negligence detection, and secure client communication.',
  manifest:    '/manifest.json',
  appleWebApp: {
    capable:        true,
    title:          'Legal Eagle',
    statusBarStyle: 'black-translucent',
  },
  formatDetection: { telephone: false },
  icons: {
    icon: [
      { url: '/icons/icon-32x32.png',   sizes: '32x32',   type: 'image/png' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/icon-152x152.png', sizes: '152x152', type: 'image/png' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
    other: [
      { rel: 'mask-icon', url: '/icons/icon-512x512.png', color: '#d4a017' },
    ],
  },
};

export const viewport: Viewport = {
  themeColor:         [
    { media: '(prefers-color-scheme: light)', color: '#f5f4f0' },
    { media: '(prefers-color-scheme: dark)',  color: '#0f172a' },
  ],
  width:              'device-width',
  initialScale:       1,
  minimumScale:       1,
  viewportFit:        'cover',  // safe-area insets on notched phones
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        <link rel="preconnect"   href="https://fonts.googleapis.com" />
        <link rel="preconnect"   href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,600&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        {/* PWA meta tags for iOS */}
        <meta name="mobile-web-app-capable"          content="yes" />
        <meta name="apple-mobile-web-app-capable"     content="yes" />
        <meta name="apple-mobile-web-app-title"       content="Legal Eagle" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="application-name"                 content="Legal Eagle" />
        <meta name="msapplication-TileColor"          content="#0f172a" />
        <meta name="msapplication-TileImage"          content="/icons/icon-144x144.png" />
      </head>
      <body style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
        <AuthProvider>
          <I18nProvider>
            {children}
          </I18nProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
