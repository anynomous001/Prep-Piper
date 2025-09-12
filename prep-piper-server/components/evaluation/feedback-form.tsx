"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Star, MessageSquare, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import axios from "axios"

export default function FeedbackForm() {
  const [rating, setRating] = useState(0)
  const [comments, setComments] = useState("")
  const [loading, setLoading] = useState(false)
  const [hoveredStar, setHoveredStar] = useState(0)
  const [submittedMessage, setSubmittedMessage] = useState('')
  const router = useRouter()

  const submit = async () => {
    setLoading(true)
    try {
      const result = await axios.post("/api/feedback", { rating, comments })
      if (result.data.success) {
        // router.push("/thank-you")
        setComments("")
setSubmittedMessage(result.data.message);
      }
    } catch (error) {
      console.error("Failed to submit feedback:", error)
    } finally {
      setLoading(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  }

  const starVariants = {
    hover: { scale: 1.2, rotate: 5 },
    tap: { scale: 0.9 },
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="w-2/3">
      <div className="relative bg-gradient-to-br from-gray-900/90 to-gray-950/90 backdrop-blur border border-gray-800 rounded-3xl p-8 sm:p-12 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 via-cyan-500/10 to-blue-500/10 rounded-3xl" />
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-teal-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-cyan-500/20 rounded-full blur-3xl" />

        {/* Content */}
        <div className="relative z-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, repeatDelay: 3 }}
                className="p-3 bg-teal-400/20 rounded-full"
              >
                <MessageSquare className="w-8 h-8 text-teal-400" />
              </motion.div>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              We'd Love Your{" "}
              <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">Feedback</span>
            </h3>
            <p className="text-lg text-gray-300 max-w-xl mx-auto">
              Help us improve Prep-Piper by sharing your thoughts about your interview experience.
            </p>
          </div>

          {/* Rating Section */}
          <div className="text-center mb-8">
            <p className="text-gray-200 mb-6 font-medium text-lg">How would you rate your experience?</p>
            <div className="flex justify-center space-x-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <motion.button
                  key={star}
                  variants={starVariants}
                  whileHover="hover"
                  whileTap="tap"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
                  className="focus:outline-none focus:ring-2 focus:ring-teal-500 rounded-full p-2"
                >
                  <Star
                    className={`w-10 h-10 transition-all duration-200 ${
                      star <= (hoveredStar || rating)
                        ? "text-teal-400 fill-teal-400"
                        : "text-gray-600 hover:text-gray-400"
                    }`}
                  />
                </motion.button>
              ))}
            </div>
            {rating > 0 && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-teal-300 mt-4 font-medium text-lg"
              >
                {rating === 5
                  ? "Excellent! 🌟"
                  : rating === 4
                    ? "Great! 👍"
                    : rating === 3
                      ? "Good! 👌"
                      : rating === 2
                        ? "Fair 😐"
                        : "Poor 😞"}
              </motion.p>
            )}
          </div>

          {/* Comments Section */}
          <div className="mb-8">
            <label className="block text-gray-200 font-medium mb-4 text-lg">Additional comments (optional)</label>
            <Textarea
              className="bg-gray-800/50 border-gray-700 text-gray-200 placeholder-gray-400 focus:border-teal-500 focus:ring-teal-500/20 min-h-[120px] resize-none text-base rounded-xl"
              placeholder="Share your thoughts about the interview experience, what you liked, or how we can improve..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
            />
          </div>
            {submittedMessage && (
                <motion.div>
            <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-green-400 mb-6 font-medium text-center"
                >{submittedMessage}</motion.p>
                </motion.div>
            )}

          {/* Submit Button */}
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              size="lg"
              className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold py-6 text-lg transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-teal-500/25 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
              disabled={rating === 0 || loading}
              onClick={submit}
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
                  Submitting Feedback...
                </div>
              ) : (
                <div className="flex items-center">
                  <Send className="w-5 h-5 mr-3" />
                  Submit Feedback
                </div>
              )}
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
