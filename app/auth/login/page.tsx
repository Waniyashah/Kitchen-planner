"use client"

import Link from "next/link"
import { LoginForm } from "@/components/auth/login-form"

export default function LoginPage() {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-white">
      {/* Sidebar */}
      <div className="w-full md:w-1/3 bg-gray-900 text-white flex flex-col items-center justify-center p-8">
        <div className="text-center">
          <Link href="/" className="inline-block mb-6 text-white hover:opacity-80 transition">
            <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-white text-base font-semibold tracking-widest uppercase">Kitchen</h1>
          <h1 className="text-white text-base font-semibold tracking-widest uppercase">By WASA</h1>
          <p className="text-gray-300 text-xs mt-8 md:mt-12 leading-relaxed font-light">
            Welcome back to your
            <br />
            <span className="font-semibold text-white">Kitchen Planner</span>
            <br />
            Account
          </p>
        </div>
      </div>

      {/* Main Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Sign In</h2>
            <p className="text-gray-600 text-sm mt-1">Access your saved designs and orders</p>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
