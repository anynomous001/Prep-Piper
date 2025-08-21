"use client"

import { motion } from "framer-motion"
import { ArrowLeft, Trophy, Target, Zap } from "lucide-react"
import { DIFFICULTY_LEVELS, type DifficultyId } from "@/lib/constants"

interface DifficultySelectionProps {
  selectedDifficulty: DifficultyId | null
  onDifficultySelect: (difficulty: DifficultyId) => void
  onBack: () => void
  canProceed: boolean
  onBegin: () => void
}

const difficultyIcons = {
  ALPHA: Target,
  BETA: Zap,
  GAMMA: Trophy,
}

export function DifficultySelection({
  selectedDifficulty,
  onDifficultySelect,
  onBegin,
  onBack,
  canProceed,
}: DifficultySelectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">Choose Your Level</h1>
        <p className="text-xl text-slate-400">Select the difficulty that matches your experience</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.entries(DIFFICULTY_LEVELS).map(([key, level], index) => {
          const Icon = difficultyIcons[key as keyof typeof difficultyIcons]

          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all hover:scale-105 ${
                selectedDifficulty === level.id.toUpperCase()
                  ? "bg-card border-primary shadow-lg shadow-primary/25"
                  : "bg-card border-border hover:border-muted-foreground/50"
              }`}
              onClick={() => onDifficultySelect(level.id as DifficultyId)}
            >
              <div className="text-center">
                <div
                  className={`w-16 h-16 rounded-full bg-gradient-to-r ${level.color} flex items-center justify-center mx-auto mb-4`}
                >
                  <Icon className="w-8 h-8 text-white" />
                </div>

                <h3 className="text-2xl font-bold text-foreground mb-1">{level.title}</h3>
                <p className="text-lg text-card-foreground mb-3">{level.subtitle}</p>
                <p className="text-sm text-muted-foreground">{level.description}</p>
              </div>

              {selectedDifficulty?.toUpperCase() === level.id.toUpperCase() && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-4 right-4 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center"
                >
                  <div className="w-2 h-2 bg-white rounded-full" />
                </motion.div>
              )}
            </motion.div>
          )
        })}
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
          onClick={() => onBegin()}
          disabled={!canProceed}
          whileHover={{ scale: canProceed ? 1.05 : 1 }}
          whileTap={{ scale: canProceed ? 0.95 : 1 }}
          className={`flex items-center gap-2 px-8 py-3 rounded-lg font-semibold transition-all ${
            canProceed
              ? "bg-gradient-to-r from-blue-600 to-teal-600 text-white hover:from-blue-700 hover:to-teal-700"
              : "bg-slate-700 text-slate-400 cursor-not-allowed"
          }`}
        >
          Start Interview
          <Trophy className="w-5 h-5" />
        </motion.button>
      </div>
    </motion.div>
  )
}
