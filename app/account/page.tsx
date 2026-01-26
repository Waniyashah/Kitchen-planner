"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function AccountPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">Account</h1>
          <p className="text-muted-foreground text-lg">Manage your account and preferences</p>
        </div>

        <div className="max-w-md mx-auto space-y-4">
          <Link href="/auth/login" className="block">
            <Button className="w-full bg-primary hover:bg-primary/90">Sign In</Button>
          </Link>
          <Link href="/auth/signup" className="block">
            <Button variant="outline" className="w-full bg-transparent">
              Create Account
            </Button>
          </Link>
          <Link href="/dashboard" className="block">
            <Button variant="outline" className="w-full bg-transparent">
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  )
}
