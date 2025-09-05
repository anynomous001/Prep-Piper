"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, Mail, ArrowLeft } from "lucide-react"

export default function PendingApprovalPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center">
            <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
          </div>
          <CardTitle className="text-2xl font-bold">Account Pending Approval</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6 text-center">
          <div className="space-y-2">
            <p className="text-gray-600 dark:text-gray-400">
              Thank you for creating your account! Your registration is currently under review.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              You'll receive an email notification once your account has been approved and you can start using Prep Piper.
            </p>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 mb-2">
              <Mail className="w-4 h-4" />
              <span className="font-medium text-sm">What's next?</span>
            </div>
            <p className="text-sm text-blue-600 dark:text-blue-400">
              We'll send you an email at your registered address once your account is approved. 
              This usually takes 24-48 hours.
            </p>
          </div>
          
          <div className="pt-4 space-y-3">
            <Button asChild className="w-full">
              <Link href="/auth/signin">
                Try Again Later
              </Link>
            </Button>
            
            <Button variant="outline" asChild className="w-full">
              <Link href="/" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Link>
            </Button>
          </div>
          
          <div className="pt-4 border-t">
            <p className="text-xs text-gray-500">
              Need help? Contact us at{" "}
              <a href="https://x.com/Pritamchak001" className="text-blue-500 hover:underline">
                support@preppiper.com
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
