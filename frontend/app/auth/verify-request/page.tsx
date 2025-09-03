// <------------ this is a new update---->
"use client"

import { motion } from "framer-motion"
import { Mail, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export default function VerifyRequestPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md text-center"
      >
        <div className="bg-slate-800 rounded-2xl p-8 shadow-2xl border border-slate-700">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <Mail className="w-8 h-8 text-white" />
          </motion.div>

          <h1 className="text-2xl font-bold text-white mb-4">Check Your Email</h1>
          <p className="text-slate-400 mb-6">We've sent you a sign-in link. Click the link in the email to continue.</p>

          <div className="bg-slate-700 rounded-lg p-4 mb-6">
            <p className="text-sm text-slate-300">
              <strong>Note:</strong> New accounts require manual approval before you can start interviews. You'll
              receive a notification once your account is approved.
            </p>
          </div>

          <motion.button
            onClick={() => router.push("/")}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors mx-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}
// <---------------------------------------->
