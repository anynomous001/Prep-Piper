"use client"

import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { ROLES, type RoleId } from "@/lib/constants"

interface RoleSelectionProps {
  selectedRole: RoleId | null
  onRoleSelect: (role: RoleId) => void
  onNext: () => void
  canProceed: boolean
}

export function RoleSelection({ selectedRole, onRoleSelect, onNext, canProceed }: RoleSelectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">Choose Your Role</h1>
        <p className="text-xl text-slate-400">What type of developer are you?</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(ROLES).map(([key, role], index) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all hover:scale-105 ${
              selectedRole === role.id.toUpperCase()
                ? "bg-primary/10 border-primary shadow-lg shadow-primary/25"
                : "bg-card border-border hover:border-muted-foreground/50"
            }`}
            onClick={() => onRoleSelect(role.id as RoleId)}
          >
            <div className="text-center">
              <div className="text-6xl mb-4">{role.icon}</div>
              <h3 className="text-2xl font-bold text-foreground mb-2">{role.title}</h3>
              <p className="text-muted-foreground mb-4">{role.description}</p>

              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-card-foreground">Sample Interview Topics:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {role.sampleTasks.map((task, taskIndex) => (
                    <li key={taskIndex}>• {task}</li>
                  ))}
                </ul>
              </div>
            </div>

            {selectedRole === role.id.toUpperCase() && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-4 right-4 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center"
              >
                <div className="w-2 h-2 bg-white rounded-full" />
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      <div className="flex justify-end">
        <motion.button
          onClick={onNext}
          disabled={!canProceed}
          whileHover={{ scale: canProceed ? 1.05 : 1 }}
          whileTap={{ scale: canProceed ? 0.95 : 1 }}
          className={`flex items-center gap-2 px-8 py-3 rounded-lg font-semibold transition-all ${
            canProceed
              ? "bg-gradient-to-r from-blue-600 to-teal-600 text-white hover:from-blue-700 hover:to-teal-700"
              : "bg-slate-700 text-slate-400 cursor-not-allowed"
          }`}
        >
          Next
          <ArrowRight className="w-5 h-5" />
        </motion.button>
      </div>
    </motion.div>
  )
}
