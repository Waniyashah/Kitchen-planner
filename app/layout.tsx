import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import {LanguageProvider} from "@/lib/language_context"
import Providers from '@/components/Providers'
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Kitchen Planner - Design Your Dream Kitchen",
  description:
    "Create your perfect kitchen with our advanced 3D kitchen planner. Design, visualize, and purchase kitchen cabinets and appliances online.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <LanguageProvider>
          <Providers>{children}</Providers>
          <Analytics />
        </LanguageProvider>
      </body>
    </html>
  )
}
