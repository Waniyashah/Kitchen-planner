"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function EmailAuthPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle login/signup logic here
    console.log("Email:", email, "Password:", password)
  }

  return (
    <div className="flex min-h-screen bg-white">
      {/* Gray Sidebar */}
      <div className="w-1/3 bg-[background: #00000080;
] flex flex-col items-center justify-center p-8">
        <div className="text-center">
          <button onClick={() => router.back()} className="inline-block mb-8 text-white hover:opacity-80">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-white text-sm font-semibold tracking-wider">KITCHEN</h1>
          <h1 className="text-white text-sm font-semibold tracking-wider">BY WASA</h1>
          <p className="text-white text-xs mt-16 leading-relaxed font-light">
            Log in to your
            <br />
            <span className="font-semibold">KITCHEN BY WASA</span>
            <br />
            Account
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <form onSubmit={handleContinue} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Please Enter your Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded focus:outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded focus:outline-none focus:border-black"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-black text-white font-semibold py-3 px-6 rounded-full hover:bg-gray-800 transition"
            >
              Continue
            </button>
          </form>

          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-gray-300" />
            <span className="text-gray-500 text-sm">OR</span>
            <div className="flex-1 h-px bg-gray-300" />
          </div>

          <div className="space-y-3">
            <button
              onClick={() => router.push("/auth/email")}
              className="w-full bg-black text-white font-semibold py-3 px-6 rounded-full hover:bg-gray-800 transition"
            >
              Create New Account
            </button>

            <button className="w-full bg-white text-black font-semibold py-3 px-6 rounded-full border-2 border-black hover:bg-gray-50 transition">
              Forgot Password
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
