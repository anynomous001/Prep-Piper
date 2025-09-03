"use client"

import Link from "next/link"
import { useState, useTransition } from "react"
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { LoginSchema } from '@/schemas'
import { login } from '@/actions/login'
import { signIn } from 'next-auth/react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Github, Linkedin, Mail } from "lucide-react"
import * as z from 'zod'

export default function SignInPage() {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string>("")
  const [rememberMe, setRememberMe] = useState(false)

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  })

  const onSubmit = (values: z.infer<typeof LoginSchema>) => {
    setError("")
    startTransition(() => {
      login(values)
        .then((data) => {
          if (!data.success) {
            setError(data.message)
          }
        })
        .catch(() => {
          setError("Something went wrong!")
        })
    })
  }

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/' })
  }

  const handleGithubSignIn = () => {
    signIn('github', { callbackUrl: '/' })
  }

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
          <Button 
            variant="outline" 
            className="gap-2 bg-transparent"
            onClick={handleGoogleSignIn}
            type="button"
          >
            <Mail className="h-4 w-4" /> Google
          </Button>
          <Button 
            variant="outline" 
            className="gap-2 bg-transparent"
            onClick={handleGithubSignIn}
            type="button"
          >
            <Github className="h-4 w-4" /> GitHub
          </Button>
          <Button variant="outline" className="gap-2 bg-transparent" disabled>
            <Linkedin className="h-4 w-4" /> LinkedIn
          </Button>
        </div>

        <div className="my-4 text-center text-xs text-foreground/60">Or continue with</div>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 border border-red-200 p-3">
            <div className="text-red-800 text-sm">{error}</div>
          </div>
        )}

        <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              {...form.register("email")}
              disabled={pending}
              required 
            />
            {form.formState.errors.email && (
              <p className="text-sm text-red-600">{form.formState.errors.email.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              {...form.register("password")}
              disabled={pending}
              required
            />
            {form.formState.errors.password && (
              <p className="text-sm text-red-600">{form.formState.errors.password.message}</p>
            )}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox 
                id="remember" 
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(Boolean(checked))}
              />
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
            disabled={pending}
            className="bg-gradient-to-r from-teal-500 to-blue-500 text-white hover:from-teal-400 hover:to-blue-400"
          >
            {pending ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-foreground/70">
          Don&apos;t have an account?{" "}
          <Link href="/auth/signup" className="text-teal-400 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}