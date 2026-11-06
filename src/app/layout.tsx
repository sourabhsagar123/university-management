import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "University Management System — Chandigarh University",
  description: "Academic management system for Chandigarh University",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased bg-white text-gray-900">{children}</body>
    </html>
  )
}
