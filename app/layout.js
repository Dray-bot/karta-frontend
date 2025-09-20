import './globals.css'
import { ClerkProvider } from '@clerk/nextjs'
import { Poppins } from 'next/font/google'

// Google Font
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
})

export const metadata = {
  title: 'Karta',
  description: 'Buy and sell anything with ease on Karta',
  icons: {
    icon: '/images/karta.png', // replace with your own favicon in /public
  },
  openGraph: {
    title: 'Karta Marketplace',
    description: 'Buy and sell anything with ease on Karta',
    url: '/images/karta.png',
    siteName: 'Karta',
    images: [
      {
        url: '/images/karta.png', // add this image inside /public
        width: 1200,
        height: 630,
        alt: 'Karta Marketplace Preview',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Karta Marketplace',
    description: 'Buy and sell anything with ease on Karta',
    images: ['/images/karta.png'],
  },
}

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en" className={poppins.className}>
        <body className="bg-gray-50 text-gray-900">
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
