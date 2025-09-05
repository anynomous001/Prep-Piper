// components/sections/FooterSection.tsx
"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Github, Twitter, Linkedin, Mail } from "lucide-react"

export function SiteFooter() {
  return (
    <footer className="bg-gray-950 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold text-white mb-4">
              Prep Piper
            </h3>
            <p className="text-gray-300 mb-6 max-w-md">
              Master technical interviews with AI-powered practice sessions. 
              Get personalized feedback and build confidence for your next opportunity.
            </p>
            
            {/* Newsletter Signup */}
            <div className="flex flex-col sm:flex-row gap-3 max-w-md">
              <Input 
                placeholder="Enter your email"
                className="bg-gray-900 border-gray-700 text-white placeholder-gray-400 focus:border-teal-400"
              />
              <Button 
                className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/25"
              >
                Subscribe
              </Button>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Product</h4>
            <ul className="space-y-3">
              <li>
                <Link 
                  href="/features" 
                  className="text-gray-300 hover:text-teal-400 transition-colors"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link 
                  href="/pricing" 
                  className="text-gray-300 hover:text-teal-400 transition-colors"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link 
                  href="/demo" 
                  className="text-gray-300 hover:text-teal-400 transition-colors"
                >
                  Demo
                </Link>
              </li>
              <li>
                <Link 
                  href="/api" 
                  className="text-gray-300 hover:text-teal-400 transition-colors"
                >
                  API
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Support</h4>
            <ul className="space-y-3">
              <li>
                <Link 
                  href="/help" 
                  className="text-gray-300 hover:text-teal-400 transition-colors"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link 
                  href="/contact" 
                  className="text-gray-300 hover:text-teal-400 transition-colors"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link 
                  href="/privacy" 
                  className="text-gray-300 hover:text-teal-400 transition-colors"
                >
                  Privacy
                </Link>
              </li>
              <li>
                <Link 
                  href="/terms" 
                  className="text-gray-300 hover:text-teal-400 transition-colors"
                >
                  Terms
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2025 Prep Piper. All rights reserved.
          </p>
          
          {/* Social Links */}
          <div className="flex space-x-4 mt-4 sm:mt-0">
            <Link 
              href="https://github.com" 
              className="text-gray-400 hover:text-teal-400 transition-colors hover:scale-110 transform duration-200"
            >
              <Github className="w-5 h-5" />
            </Link>
            <Link 
              href="https://twitter.com" 
              className="text-gray-400 hover:text-teal-400 transition-colors hover:scale-110 transform duration-200"
            >
              <Twitter className="w-5 h-5" />
            </Link>
            <Link 
              href="https://linkedin.com" 
              className="text-gray-400 hover:text-teal-400 transition-colors hover:scale-110 transform duration-200"
            >
              <Linkedin className="w-5 h-5" />
            </Link>
            <Link 
              href="mailto:contact@prepiper.com" 
              className="text-gray-400 hover:text-teal-400 transition-colors hover:scale-110 transform duration-200"
            >
              <Mail className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}