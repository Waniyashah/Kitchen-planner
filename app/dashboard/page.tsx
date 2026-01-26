"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { UserDashboard } from "@/components/dashboard/user-dashboard"
import { useEffect, useState } from "react"
import { redirect } from "next/navigation"

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      redirect("/auth/login")
    }
    setUser(JSON.parse(userData))
    setIsLoading(false)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <UserDashboard user={user} />
      </main>
      <Footer />
    </div>
  )
}
