"use client"

import Link from "next/link"
import { useState } from "react"
import { Mic, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/theme-toggle"

export function SiteHeader() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/40">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6">
        <Link href="/" className="group inline-flex items-center gap-2">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-md bg-foreground/10 ring-1 ring-inset ring-border group-hover:ring-foreground/40 transition">
            <Mic className="h-4 w-4 text-foreground/80" aria-hidden="true" />
            <span className="sr-only">Prep Piper</span>
          </div>
          <span className="text-balance text-lg font-semibold tracking-tight">Prep Piper</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link href="#features" className="text-sm text-foreground/80 hover:text-foreground transition-colors">
            Features
          </Link>
          <Link href="#how" className="text-sm text-foreground/80 hover:text-foreground transition-colors">
            How It Works
          </Link>
          <Link href="#pricing" className="text-sm text-foreground/80 hover:text-foreground transition-colors">
            Pricing
          </Link>
          <Link href="#reviews" className="text-sm text-foreground/80 hover:text-foreground transition-colors">
            Reviews
          </Link>
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          <Button asChild variant="ghost">
            <Link href="/auth/sign-in">Sign In</Link>
          </Button>
          <Button
            asChild
            className="bg-gradient-to-r from-teal-500 to-blue-500 text-white shadow-sm hover:from-teal-400 hover:to-blue-400"
          >
            <Link href="/auth/sign-up">Sign Up</Link>
          </Button>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <Button variant="outline" size="icon" aria-label="Toggle menu" onClick={() => setOpen(!open)}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border/50 bg-background/80 backdrop-blur md:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3 md:px-6">
            <Link
              onClick={() => setOpen(false)}
              href="#features"
              className="rounded-md px-3 py-2 text-sm hover:bg-foreground/5"
            >
              Features
            </Link>
            <Link
              onClick={() => setOpen(false)}
              href="#how"
              className="rounded-md px-3 py-2 text-sm hover:bg-foreground/5"
            >
              How It Works
            </Link>
            <Link
              onClick={() => setOpen(false)}
              href="#pricing"
              className="rounded-md px-3 py-2 text-sm hover:bg-foreground/5"
            >
              Pricing
            </Link>
            <Link
              onClick={() => setOpen(false)}
              href="#reviews"
              className="rounded-md px-3 py-2 text-sm hover:bg-foreground/5"
            >
              Reviews
            </Link>
            <div className="mt-2 flex items-center gap-2">
              <Button asChild variant="ghost" className="flex-1">
                <Link href="/sign-in">Sign In</Link>
              </Button>
              <Button
                asChild
                className="flex-1 bg-gradient-to-r from-teal-500 to-blue-500 text-white hover:from-teal-400 hover:to-blue-400"
              >
                <Link href="/sign-up">Sign Up</Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
