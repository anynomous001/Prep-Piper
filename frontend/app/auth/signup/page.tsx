// <------------ this is a new update---->
"use client"

import * as React from "react"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Mail, ArrowRight, Loader2, UserPlus } from "lucide-react"

export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage("")

    try {
      const result = await signIn("email", {
        email,
        redirect: false,
      })

      if (result?.error) {
        setMessage("Failed to send sign-up email. Please try again.")
      } else {
        setMessage(
          "Account created! Check your email for a verification link. Note: Your account requires manual approval before you can start interviews.",
        )
      }
    } catch (error) {
      setMessage("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-slate-800 rounded-2xl p-8 shadow-2xl border border-slate-700">
          <div className="text-center mb-8">
            <UserPlus className="w-12 h-12 text-blue-400 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white mb-2">Join Prep Piper</h1>
            <p className="text-slate-400">Create your account to start practicing interviews</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-blue-600 to-teal-600 text-white py-3 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 hover:from-blue-700 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </form>

          {message && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-4 p-3 rounded-lg text-sm ${
                message.includes("Account created")
                  ? "bg-amber-900/50 text-amber-300 border border-amber-700"
                  : "bg-red-900/50 text-red-300 border border-red-700"
              }`}
            >
              {message}
            </motion.div>
          )}

          <div className="mt-6 text-center">
            <p className="text-slate-400 text-sm">
              Already have an account?{" "}
              <button
                onClick={() => router.push("/auth/signin")}
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
// <---------------------------------------->
