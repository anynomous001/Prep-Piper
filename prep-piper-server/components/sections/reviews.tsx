"use client"

import { motion } from "framer-motion"

import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Star } from "lucide-react"

const reviews = [
  {
    id: 1,
    name: "Ava Patel",
    role: "Software Engineer at Google",
    avatar: "/person-ava.jpg",
    rating: 5,
    review: "Prep Piper transformed my interview prep. The AI feedback is spot-on and helped me refine my explanations.",
    company: "Google"
  },
  {
    id: 2,
    name: "Lucas Kim",
    role: "Frontend Developer at Meta",
    avatar: "/person-lucas.jpg",
    rating: 5,
    review: "I loved the real-time transcript and feedback. It felt like a realistic interview every session.",
    company: "Meta"
  },
  {
    id: 3,
    name: "Maya Singh",
    role: "Backend Engineer at Amazon",
    avatar: "/anindita.jfif",
    rating: 5,
    review: "The personalized learning path helped me focus on weak areas. Highly recommend!",
    company: "Amazon"
  }
]

const companyLogos = [
  { name: "Google", logo: "/logos/google.png" },
  { name: "Meta", logo: "/logos/meta.png" },
  { name: "Amazon", logo: "/logos/amazon.png" },
  { name: "Netflix", logo: "/logos/netflix.png" }
]


export function Reviews() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Loved by developers
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Join thousands who improved their interview outcomes with Prep Piper.
          </p>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {reviews.map((review) => (
            <Card 
              key={review.id}
              className="bg-gray-900/50 border-gray-800 hover:bg-gray-900/70 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-teal-400/10 group"
            >
              <CardContent className="p-6">
                {/* Rating Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-teal-400 text-teal-400"
                    />
                  ))}
                </div>

                {/* Review Text */}
                <p className="text-gray-300 mb-6 leading-relaxed">
                  "{review.review}"
                </p>

                {/* User Info */}
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={review.avatar} alt={review.name} />
                    <AvatarFallback className="bg-teal-400/20 text-teal-400">
                      {review.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-white group-hover:text-teal-400 transition-colors">
                      {review.name}
                    </p>
                    <p className="text-sm text-gray-400">
                      {review.role}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Company Logos */}
        <div className="text-center">
          <p className="text-gray-400 text-sm mb-8">
            Trusted by developers at top companies
          </p>
          <div className="flex justify-center items-center gap-12 flex-wrap opacity-60">
            {companyLogos.map((company) => (
              <div 
                key={company.name}
                className="text-gray-400 hover:text-white transition-colors font-semibold text-lg"
              >
                {company.name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
