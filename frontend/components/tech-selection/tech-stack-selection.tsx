"use client"

import { motion } from "framer-motion"
import { ArrowLeft, ArrowRight, X } from "lucide-react"
import { TECH_STACKS, ROLES, type RoleId } from "@/lib/constants"

interface TechStackSelectionProps {
  selectedRole: RoleId
  selectedTechs: string[]
  onTechsChange: (techs: string[]) => void
  onNext: () => void
  onBack: () => void
  canProceed: boolean
}

export function TechStackSelection({
  selectedRole,
  selectedTechs,
  onTechsChange,
  onNext,
  onBack,
  canProceed,
}: TechStackSelectionProps) {
  const availableTechs = TECH_STACKS[selectedRole.toLowerCase() as keyof typeof TECH_STACKS]
  const roleInfo = ROLES[selectedRole.toUpperCase() as keyof typeof ROLES]

  const toggleTech = (tech: string) => {
    if (selectedTechs.includes(tech)) {
      onTechsChange(selectedTechs.filter((t) => t !== tech))
    } else {
      onTechsChange([...selectedTechs, tech])
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <div className="text-center">
        <div className="text-4xl mb-4">{roleInfo.icon}</div>
        <h1 className="text-4xl font-bold text-white mb-4">Select Your Tech Stack</h1>
        <p className="text-xl text-slate-400">Choose the technologies you want to practice with</p>
      </div>

      {selectedTechs.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-lg p-4 border border-border"
        >
          <h3 className="text-foreground font-semibold mb-3">Selected Technologies ({selectedTechs.length})</h3>
          <div className="flex flex-wrap gap-2">
            {selectedTechs.map((tech) => (
              <motion.span
                key={tech}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-3 py-1 rounded-full text-sm"
              >
                {tech}
                <button
                  onClick={() => toggleTech(tech)}
                  className="hover:bg-blue-700 rounded-full p-0.5 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </motion.span>
            ))}
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {availableTechs.map((tech, index) => (
          <motion.button
            key={tech}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => toggleTech(tech)}
            className={`p-3 rounded-lg border-2 transition-all hover:scale-105 ${
              selectedTechs.includes(tech)
                ? "bg-primary border-primary text-primary-foreground"
                : "bg-card border-border text-card-foreground hover:border-muted-foreground/50"
            }`}
          >
            <span className="text-sm font-medium">{tech}</span>
          </motion.button>
        ))}
      </div>

      <div className="flex justify-between">
        <motion.button
          onClick={onBack}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </motion.button>

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
