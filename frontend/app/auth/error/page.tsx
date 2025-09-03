// <------------ this is a new update---->
"use client"

import { motion } from "framer-motion"
import { AlertCircle, ArrowLeft } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense } from "react"

function ErrorContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const error = searchParams.get("error")

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case "Configuration":
        return "There is a problem with the server configuration."
      case "AccessDenied":
        return "Your account is not approved yet. Please wait for approval."
      case "Verification":
        return "The verification link was invalid or has expired."
      default:
        return "An error occurred during authentication."
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md text-center"
      >
        <div className="bg-card rounded-2xl p-8 shadow-2xl border border-border">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <AlertCircle className="w-8 h-8 text-white" />
          </motion.div>

          <h1 className="text-2xl font-bold text-foreground mb-4">Authentication Error</h1>
          <p className="text-muted-foreground mb-6">{getErrorMessage(error)}</p>

          <motion.button
            onClick={() => router.push("/")}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mx-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ErrorContent />
    </Suspense>
  )
}
// <---------------------------------------->
