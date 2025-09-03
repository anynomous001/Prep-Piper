import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { SessionProvider } from "next-auth/react"
import { auth } from "@/lib/auth"
import "./globals.css"

export const metadata: Metadata = {
  
 icons: {
    icon: '/mic.svg',
    shortcut: '/mic.svg',
    apple: '/mic.svg',
  },
  title: "Prep Piper — Master Technical Interviews with AI",
  description: "Practice coding interviews, system design, and behavioral questions with real-time AI feedback.",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await auth()

  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body>
        <SessionProvider session={session}>
          <Suspense>
            {children}
          </Suspense>
          <Analytics />
        </SessionProvider>
      </body>
    </html>
  )
}


