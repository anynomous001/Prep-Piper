"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Wifi, WifiOff, AlertCircle } from "lucide-react"

interface ConnectionStatusProps {
  isConnected: boolean
  error?: string | null
}

export function ConnectionStatus({ isConnected, error }: ConnectionStatusProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-20 right-4 z-50"
      >
        {error ? (
          <Badge className="bg-red-100 text-red-700 border-red-200">
            <AlertCircle className="mr-1 w-3 h-3" />
            Connection Error
          </Badge>
        ) : (
          <Badge
            className={
              isConnected
                ? "bg-green-100 text-green-700 border-green-200"
                : "bg-yellow-100 text-yellow-700 border-yellow-200"
            }
          >
            {isConnected ? (
              <>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                >
                  <Wifi className="mr-1 w-3 h-3" />
                </motion.div>
                Connected
              </>
            ) : (
              <>
                <WifiOff className="mr-1 w-3 h-3" />
                Connecting...
              </>
            )}
          </Badge>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
