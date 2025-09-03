// <------------ this is a new update---->
"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Clock, Mail, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { signOut } from "next-auth/react"

const PendingApprovalPage: React.FC = () => {
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
            className="w-16 h-16 bg-amber-600 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <Clock className="w-8 h-8 text-white" />
          </motion.div>

          <h1 className="text-2xl font-bold text-white mb-4">Account Pending Approval</h1>
          <p className="text-slate-400 mb-6">
            Your account has been created successfully! However, access to interviews requires manual approval from our
            team.
          </p>

          <div className="bg-slate-700 rounded-lg p-4 mb-6 text-left">
            <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              What happens next?
            </h3>
            <ul className="text-sm text-slate-300 space-y-1">
              <li>• Our team will review your account</li>
              <li>• You'll receive an email once approved</li>
              <li>• Approval typically takes 1-2 business days</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <motion.button
              onClick={() => router.push("/")}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 flex items-center justify-center gap-2 text-slate-400 hover:text-slate-300 transition-colors py-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </motion.button>
            <motion.button
              onClick={() => signOut({ callbackUrl: "/" })}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 bg-slate-700 text-white py-2 px-4 rounded-lg hover:bg-slate-600 transition-colors"
            >
              Sign Out
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}


export default PendingApprovalPage