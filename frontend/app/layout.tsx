import type React from "react"
import type { Metadata } from "next"
import { Montserrat, Open_Sans } from "next/font/google"
import AuthProvider from "@/components/providers/session-provider"
import "./globals.css"

const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-montserrat",
  weight: ["400", "600", "700", "900"],
})

const openSans = Open_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-open-sans",
  weight: ["400", "500", "600"],
})

export const metadata: Metadata = {
  title: "Prep Piper - Master Your Interviews with AI",
  description:
    "Practice interviews with AI-powered feedback and personalized coaching. Boost your confidence with real-time insights.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${montserrat.variable} ${openSans.variable} antialiased`}>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
