"use client"

import { useState, FormEvent } from "react"
import { useRouter } from "next/navigation"
import { login } from "@/lib/actions/auth"
import { GraduationCap, Loader2, Eye, EyeOff } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const formData = new FormData()
      formData.append("email", email)
      formData.append("password", password)

      const result = await login(formData)

      if (result?.error) {
        setError(result.error)
        setLoading(false)
        return
      }

      router.push("/admin")
      router.refresh()
    } catch {
      setError("An unexpected error occurred. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50 p-4">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex">
        {/* Left branding panel */}
        <div className="hidden md:flex w-[45%] bg-[#1e3a5f] text-white flex-col justify-center items-center p-10">
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center">
              <GraduationCap className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Chandigarh University
              </h1>
              <div className="mt-1 w-12 h-0.5 bg-white/30 mx-auto" />
            </div>
            <p className="text-sm text-white/70 leading-relaxed max-w-[240px]">
              University Management System for academic administration and student management.
            </p>
          </div>
        </div>

        {/* Right login form */}
        <div className="flex-1 p-8 md:p-10 flex flex-col justify-center">
          <div className="max-w-sm mx-auto w-full">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900">Sign in</h2>
              <p className="mt-1.5 text-sm text-gray-500">
                Enter your credentials to access the dashboard
              </p>
            </div>

            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@university.edu"
                  required
                  autoComplete="email"
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition-colors placeholder:text-gray-400"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition-colors placeholder:text-gray-400 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1e3a5f] text-white py-2.5 px-4 rounded-lg text-sm font-medium hover:bg-[#162d4a] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:ring-offset-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </button>
            </form>

            {/* Quick Demo Fill Buttons */}
            <div className="mt-6 pt-5 border-t border-gray-100">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                Demo Accounts (Click to Auto-fill):
              </p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEmail("admin@cu.edu")
                    setPassword("password123")
                  }}
                  className="px-2 py-1.5 text-xs font-medium rounded-md bg-gray-100 hover:bg-gray-200 text-gray-800 transition-colors"
                >
                  Admin
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmail("faculty@cu.edu")
                    setPassword("password123")
                  }}
                  className="px-2 py-1.5 text-xs font-medium rounded-md bg-gray-100 hover:bg-gray-200 text-gray-800 transition-colors"
                >
                  Faculty
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmail("student@cu.edu")
                    setPassword("password123")
                  }}
                  className="px-2 py-1.5 text-xs font-medium rounded-md bg-gray-100 hover:bg-gray-200 text-gray-800 transition-colors"
                >
                  Student
                </button>
              </div>
            </div>

            <p className="mt-6 text-center text-xs text-gray-400">
              © {new Date().getFullYear()} Chandigarh University. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
