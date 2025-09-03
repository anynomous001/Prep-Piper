"use client"

import { useState, useEffect } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Mic, Brain, Target, Star, Play, CheckCircle, LogOut } from "lucide-react"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import {  signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { ThemeToggle } from "@/components/theme-toggle"


export default function HomePage() {
  const [isVisible, setIsVisible] = useState(false)
  const { scrollYProgress } = useScroll()
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"])

  const { data: session, status } = useSession()
  const router = useRouter()

console.log(session)
  useEffect(() => {
    setIsVisible(true)
  }, [])

  const handleInterviewClick = () => {
  if (status === "loading") return
  if (!session) {
    signIn(undefined, { callbackUrl: "/tech-selection" })
     } else if (!session.user.approved) {
    router.push("/auth/pending-approval")
  } else {
    router.push("/tech-selection")
  }
}


  const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeInOut" },
  },
};

const floatingVariants = {
  animate: {
    y: [-10, 10, -10],
    transition: {
      duration: 4,
      repeat: Number.POSITIVE_INFINITY,
      ease: "easeInOut",
    },
  },
};
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50">
      {/* Navigation */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center space-x-2">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="w-8 h-8 bg-gradient-to-br from-blue-600 to-teal-500 rounded-lg flex items-center justify-center"
              >
                <Mic className="w-4 h-4 text-white" />
              </motion.div>
              <span className="text-xl font-black text-slate-800">Prep Piper</span>
            </motion.div>
            <div className="hidden md:flex items-center space-x-8">
              {["Features", "How It Works", "Reviews"].map((item, index) => (
                <motion.a
                  key={item}
                  href={`#${item.toLowerCase().replace(" ", "-")}`}
                  className="text-slate-600 hover:text-blue-600 transition-colors"
                  whileHover={{ y: -2 }}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index, duration: 0.4 }}
                >
                  {item}
                </motion.a>
              ))}
             <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, duration: 0.4 }}
              >
              <div className="flex items-center space-x-4">
  <ThemeToggle />
  {session ? (
    <Button
      variant="outline"
      onClick={() => signOut()}
      className="border-primary text-primary hover:bg-primary/10"
    >
      <LogOut className="w-4 h-4 mr-2" />
      Sign Out
    </Button>
  ) : (
    <Button
      variant="outline"
      onClick={() => signIn()}
      className="border-primary text-primary hover:bg-primary/10"
    >
      Sign In
    </Button>
  )}
</div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.nav>
     

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <motion.div style={{ y }} className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-teal-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-amber-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000"></div>
        </motion.div>

        <div className="max-w-7xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate={isVisible ? "visible" : "hidden"}
              className="space-y-8"
            >
              <motion.div variants={itemVariants} className="space-y-4">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">AI-Powered Interview Practice</Badge>
                </motion.div>
                <motion.h1
                  variants={itemVariants}
                  className="text-5xl lg:text-6xl font-black text-slate-800 leading-tight"
                >
                  Master Your Interviews with{" "}
                  <motion.span
                    className="bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent"
                    animate={{
                      backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "linear",
                    }}
                  >
                    AI-Powered Insights
                  </motion.span>
                </motion.h1>
                <motion.p variants={itemVariants} className="text-xl text-slate-600 leading-relaxed">
                  Practice with real-time feedback and tailored questions to boost your confidence. Get personalized
                  coaching from our advanced AI interview assistant.
                </motion.p>
              </motion.div>

              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
                  <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
                    <Button
                    onClick={handleInterviewClick}
                      size="lg"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold group transition-all duration-300"
                    >
                      Start Practicing Now
                      <motion.div
                        className="ml-2"
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                      >
                        <ArrowRight className="w-5 h-5" />
                      </motion.div>
                    </Button>
                  </motion.div>
                <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-slate-300 text-slate-700 px-8 py-4 text-lg hover:bg-slate-50 group bg-transparent"
                  >
                    <motion.div
                      className="mr-2"
                      whileHover={{ scale: 1.2, rotate: 360 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Play className="w-5 h-5" />
                    </motion.div>
                    Watch Demo
                  </Button>
                </motion.div>
              </motion.div>

              <motion.div variants={itemVariants} className="flex items-center space-x-6 pt-4">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 * i, duration: 0.3 }}
                      whileHover={{ scale: 1.2, rotate: 360 }}
                    >
                      <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                    </motion.div>
                  ))}
                </div>
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="text-slate-600"
                >
                  Trusted by 10,000+ job seekers
                </motion.span>
              </motion.div>
            </motion.div>

            <motion.div
              variants={floatingVariants}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative"
            >
              <div className="relative">
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{
                    duration: 6,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                  className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-teal-500/20 rounded-3xl blur-3xl"
                ></motion.div>
                <motion.div whileHover={{ y: -10, rotateY: 5 }} transition={{ duration: 0.3 }}>
                  <Card className="relative bg-white/90 backdrop-blur-sm border-0 shadow-2xl">
                    <CardContent className="p-8">
                      <div className="space-y-6">
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 }}
                          className="flex items-center justify-between"
                        >
                          <h3 className="text-lg font-semibold text-slate-800">Live Interview Session</h3>
                          <motion.div
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                          >
                            <Badge className="bg-green-100 text-green-700">Active</Badge>
                          </motion.div>
                        </motion.div>

                        <div className="space-y-4">
                          <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.7 }}
                            className="bg-blue-50 p-4 rounded-xl border-l-4 border-blue-600"
                          >
                            <p className="text-slate-700 font-medium">
                              "Tell me about a challenging project you've worked on and how you overcame obstacles."
                            </p>
                          </motion.div>

                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.9 }}
                            className="flex items-center space-x-3"
                          >
                            <motion.div
                              animate={{ scale: [1, 1.1, 1] }}
                              transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                              className="w-12 h-12 bg-gradient-to-br from-blue-600 to-teal-500 rounded-full flex items-center justify-center"
                            >
                              <Mic className="w-6 h-6 text-white" />
                            </motion.div>
                            <div className="flex-1">
                              <div className="bg-slate-100 rounded-lg p-3">
                                <div className="flex space-x-1">
                                  {[0, 0.1, 0.2].map((delay, i) => (
                                    <motion.div
                                      key={i}
                                      animate={{ y: [-2, -8, -2] }}
                                      transition={{
                                        duration: 0.6,
                                        repeat: Number.POSITIVE_INFINITY,
                                        delay,
                                      }}
                                      className="w-2 h-2 bg-blue-600 rounded-full"
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                          </motion.div>

                          <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 1.1 }}
                            className="bg-teal-50 p-4 rounded-xl border-l-4 border-teal-500"
                          >
                            <div className="flex items-start space-x-2">
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                              >
                                <CheckCircle className="w-5 h-5 text-teal-600 mt-0.5" />
                              </motion.div>
                              <p className="text-slate-700">
                                <span className="font-medium">AI Feedback:</span> Great structure! Consider adding more
                                specific metrics to strengthen your impact.
                              </p>
                            </div>
                          </motion.div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <motion.section
        id="features"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="py-16 px-4 sm:px-6 lg:px-8 bg-white"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-4 mb-16"
          >
            <h2 className="text-4xl font-black text-slate-800">Why Choose Prep Piper?</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Our AI-powered platform provides comprehensive interview preparation with real-time feedback and
              personalized coaching.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Brain,
                title: "AI-Powered Questions",
                description: "Get industry-specific questions tailored to your role and experience level.",
                color: "from-blue-600 to-blue-700",
              },
              {
                icon: Mic,
                title: "Real-Time Feedback",
                description: "Receive instant analysis of your responses, tone, and delivery.",
                color: "from-teal-500 to-teal-600",
              },
              {
                icon: Target,
                title: "Personalized Coaching",
                description: "Improve with targeted suggestions based on your performance patterns.",
                color: "from-amber-500 to-amber-600",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                whileHover={{ y: -10, scale: 1.02 }}
              >
                <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg h-full">
                  <CardContent className="p-8 text-center space-y-4">
                    <motion.div
                      className={`w-16 h-16 mx-auto bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center`}
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                    >
                      <feature.icon className="w-8 h-8 text-white" />
                    </motion.div>
                    <h3 className="text-xl font-bold text-slate-800">{feature.title}</h3>
                    <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* How It Works Section */}
      <motion.section
        id="how-it-works"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-50"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-4 mb-16"
          >
            <h2 className="text-4xl font-black text-slate-800">How Prep Piper Works</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Get started in minutes with our simple three-step process.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Choose Your Role",
                description: "Select your target position and industry for customized questions.",
              },
              {
                step: "02",
                title: "Practice Interview",
                description: "Answer AI-generated questions with real-time voice recognition.",
              },
              {
                step: "03",
                title: "Get Feedback",
                description: "Receive detailed analysis and improvement suggestions instantly.",
              },
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                whileHover={{ y: -5 }}
                className="text-center space-y-4"
              >
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                  className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-600 to-teal-500 rounded-full flex items-center justify-center text-white font-black text-xl"
                >
                  {step.step}
                </motion.div>
                <h3 className="text-xl font-bold text-slate-800">{step.title}</h3>
                <p className="text-slate-600 leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-teal-500 relative overflow-hidden"
      >
        <motion.div
          animate={{
            backgroundPosition: ["0% 0%", "100% 100%"],
          }}
          transition={{
            duration: 20,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "url('data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')",
          }}
        />
        <div className="max-w-4xl mx-auto text-center space-y-8 relative">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-black text-white"
          >
            Ready to Ace Your Next Interview?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-blue-100 leading-relaxed"
          >
            Join thousands of successful candidates who've improved their interview skills with Prep Piper.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Link href="/interview">
              <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 text-lg font-semibold group transition-all duration-300"
                >
                  Start Your Free Practice
                  <motion.div
                    className="ml-2"
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                  >
                    <ArrowRight className="w-5 h-5" />
                  </motion.div>
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="py-12 px-4 sm:px-6 lg:px-8 bg-slate-900"
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <motion.div whileHover={{ scale: 1.05 }} className="flex items-center space-x-2">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="w-8 h-8 bg-gradient-to-br from-blue-600 to-teal-500 rounded-lg flex items-center justify-center"
              >
                <Mic className="w-4 h-4 text-white" />
              </motion.div>
              <span className="text-xl font-black text-white">Prep Piper</span>
            </motion.div>
            <div className="flex items-center space-x-6">
              {["Privacy", "Terms", "Support"].map((item, index) => (
                <motion.a
                  key={item}
                  href="#"
                  className="text-slate-400 hover:text-white transition-colors"
                  whileHover={{ y: -2 }}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  {item}
                </motion.a>
              ))}
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="mt-8 pt-8 border-t border-slate-800 text-center"
          >
            <p className="text-slate-400">© 2024 Prep Piper. All rights reserved.</p>
          </motion.div>
        </div>
      </motion.footer>
    </div>
  )
}
