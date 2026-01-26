"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Eye, EyeOff } from "lucide-react"

export function SignupForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!termsAccepted) {
      setError("Please accept the Terms and Conditions")
      return
    }

    setIsLoading(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      localStorage.setItem("user", JSON.stringify({ email, id: Date.now() }))
      window.location.href = "/dashboard"
    } catch (err) {
      setError("Failed to create account. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="p-3 bg-red-50 text-red-700 text-sm rounded">{error}</div>}

      {/* Title */}
      <div className="text-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Please Sign Up:</h2>
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="text-sm font-medium text-gray-700 mb-2 block">
          Login Email*
        </label>
        <Input
          id="email"
          type="email"
          placeholder="Login Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border-0 border-b border-gray-300 rounded-none focus:border-gray-900 px-0 py-2"
          required
        />
      </div>

      {/* Password */}
      <div>
        <label htmlFor="password" className="text-sm font-medium text-gray-700 mb-2 block">
          Password*
        </label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border-0 border-b border-gray-300 rounded-none focus:border-gray-900 px-0 py-2 pr-10"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-0 top-2 text-gray-500 hover:text-gray-700"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Terms Checkbox */}
      <div className="flex items-start gap-2">
        <input
          type="checkbox"
          id="terms"
          checked={termsAccepted}
          onChange={(e) => setTermsAccepted(e.target.checked)}
          className="mt-1 w-4 h-4 border border-gray-300 rounded"
        />
        <label htmlFor="terms" className="text-sm text-gray-700">
          Yes, I have read and agree the Terms and Conditions.
        </label>
      </div>

      {/* Register Button */}
      <Button
        type="submit"
        className="w-full bg-black hover:bg-gray-900 text-white font-medium py-2 rounded"
        disabled={isLoading}
      >
        {isLoading ? "Registering..." : "Register Now"}
      </Button>

      {/* Cancel Button */}
      <Link href="/">
        <Button
          type="button"
          variant="outline"
          className="w-full border-black text-black hover:bg-gray-50 font-medium py-2 rounded bg-transparent"
        >
          Cancel
        </Button>
      </Link>
    </form>
  )
}
