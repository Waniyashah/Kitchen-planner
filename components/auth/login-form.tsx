"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Eye, EyeOff } from "lucide-react"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      localStorage.setItem("user", JSON.stringify({ email, id: Date.now() }))
      window.location.href = "/dashboard"
    } catch (err) {
      setError("Failed to sign in. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="p-3 bg-red-50 text-red-700 text-sm rounded">{error}</div>}

      {/* Username/Email */}
      <div>
        <label className="text-sm font-medium text-gray-900 mb-2 block">username</label>
        <Input
          type="email"
          placeholder="Your Login Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border-0 border-b border-gray-300 rounded-none focus:border-gray-900 px-0 py-2"
          required
        />
      </div>

      {/* Password */}
      <div>
        <label className="text-sm font-medium text-gray-900 mb-2 block">password</label>
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Your password"
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

      {/* Login Button */}
      <Button
        type="submit"
        className="w-full bg-black hover:bg-gray-900 text-white font-medium py-2 rounded"
        disabled={isLoading}
      >
        {isLoading ? "Logging in..." : "Login"}
      </Button>

      {/* Create New Account Button */}
      <Link href="/auth/signup">
        <Button
          type="button"
          variant="outline"
          className="w-full border-black text-black hover:bg-gray-50 font-medium py-2 rounded bg-transparent"
        >
          Create New Account
        </Button>
      </Link>

      {/* Forgot Password Button */}
      <Link href="/auth/forgot-password">
        <Button type="button" variant="ghost" className="w-full text-black hover:bg-gray-50 font-medium py-2">
          Forgot Password?
        </Button>
      </Link>
    </form>
  )
}
