"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AlertCircle } from "lucide-react"

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setSuccess(true)
    } catch (err) {
      setError("Failed to send reset email. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="text-center space-y-4">
        <div className="text-green-600 text-sm">
          Password reset link has been sent to your email address. Please check your inbox.
        </div>
        <Link href="/auth/login">
          <Button className="w-full bg-black hover:bg-gray-900 text-white font-medium py-2 rounded">
            Back to Login
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div className="text-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Forgot Password:</h2>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-700 leading-relaxed">
        Enter the Email Address you used when signing up. We will send a password reset link to your inbox
      </p>

      {/* Info Box */}
      <div className="flex gap-3 p-3 bg-gray-50 rounded border border-gray-200">
        <AlertCircle className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-gray-700">If you don't remember your login email, please contact us</p>
      </div>

      {error && <div className="p-3 bg-red-50 text-red-700 text-sm rounded">{error}</div>}

      {/* Email Input */}
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

      {/* Reset Button */}
      <Button
        type="submit"
        className="w-full bg-black hover:bg-gray-900 text-white font-medium py-2 rounded"
        disabled={isLoading}
      >
        {isLoading ? "Sending..." : "Reset Password"}
      </Button>

      {/* Cancel Button */}
      <Link href="/auth/login">
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
