"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Github, Linkedin, Mail } from "lucide-react"

export default function SignInPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-background">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-teal-500/10 blur-3xl" />
        <div className="absolute -right-16 bottom-10 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      <div className="mx-auto w-full max-w-md rounded-xl border border-border/60 bg-background/60 p-6 backdrop-blur">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold">Welcome back</h1>
          <p className="mt-1 text-sm text-foreground/70">Sign in to your account</p>
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          <Button variant="outline" className="gap-2 bg-transparent">
            <Mail className="h-4 w-4" /> Google
          </Button>
          <Button variant="outline" className="gap-2 bg-transparent">
            <Github className="h-4 w-4" /> GitHub
          </Button>
          <Button variant="outline" className="gap-2 bg-transparent">
            <Linkedin className="h-4 w-4" /> LinkedIn
          </Button>
        </div>

        <div className="my-4 text-center text-xs text-foreground/60">Or continue with</div>

        <form className="grid gap-4" onSubmit={(e) => e.preventDefault()}>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox id="remember" />
              <Label htmlFor="remember" className="text-sm text-foreground/80">
                Remember me
              </Label>
            </div>
            <Link href="#" className="text-sm text-teal-400 hover:underline">
              Forgot password?
            </Link>
          </div>
          <Button
            type="submit"
            className="bg-gradient-to-r from-teal-500 to-blue-500 text-white hover:from-teal-400 hover:to-blue-400"
          >
            Sign In
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-foreground/70">
          Don&apos;t have an account?{" "}
          <Link href="/sign-up" className="text-teal-400 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
