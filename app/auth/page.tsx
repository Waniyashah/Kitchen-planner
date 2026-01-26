"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"

export default function AuthPage() {
  const router = useRouter()

  return (
    <div className="flex min-h-screen bg-white">
      {/* Gray Sidebar */}
      <div className="w-1/3 bg-gray-500 flex flex-col items-center justify-center p-8">
        <div className="text-center">
          <Link href="/" className="inline-block mb-8">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
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
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Log in or Sign up</h2>
            <p className="text-gray-600 text-sm">Use Your Google Account to Login</p>
          </div>

          <div className="space-y-4">
            <button className="w-full bg-black text-white font-semibold py-3 px-6 rounded-full hover:bg-gray-800 transition">
              Continue with Google
            </button>

            <button
              onClick={() => router.push("/auth/email")}
              className="w-full bg-white text-black font-semibold py-3 px-6 rounded-full border-2 border-black hover:bg-gray-50 transition"
            >
              Continue with Email
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
