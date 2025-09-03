"use client"

import Link from "next/link"
import { useState } from "react"
import { Mic, Menu, X, LogOut, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { useSession, signOut } from "next-auth/react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

export function SiteHeader() {
  const [open, setOpen] = useState(false)
  const { data: session, status } = useSession()
  const isLoading = status === "loading"

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" })
  }

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
          
          {isLoading ? (
            // Show loading state
            <div className="h-9 w-20 animate-pulse rounded-md bg-foreground/10" />
          ) : session ? (
            // Show user menu when logged in
            <div className="flex items-center gap-2">
              <Button
                asChild
                variant="outline"
                className="border-teal-500/20 text-teal-600 hover:bg-teal-500/10"
              >
                <Link href="/tech-selection">Start Interview</Link>
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 px-3">
                    <User className="h-4 w-4" />
                    <span className="max-w-32 truncate">
                      {session.user?.name || session.user?.email || "User"}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5 text-sm text-foreground/70">
                    {session.user?.email}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/tech-selection" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/interview" className="cursor-pointer">
                      <Mic className="mr-2 h-4 w-4" />
                      Interview
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="cursor-pointer text-red-600 focus:text-red-600"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            // Show sign in/up buttons when not logged in
            <>
              <Button asChild variant="ghost">
                <Link href="/auth/signin">Sign In</Link>
              </Button>
              <Button
                asChild
                className="bg-gradient-to-r from-teal-500 to-blue-500 text-white shadow-sm hover:from-teal-400 hover:to-blue-400"
              >
                <Link href="/auth/register">Sign Up</Link>
              </Button>
            </>
          )}
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
            
            {/* Mobile authentication section */}
            <div className="mt-2 border-t border-border/50 pt-2">
              {isLoading ? (
                <div className="h-9 animate-pulse rounded-md bg-foreground/10" />
              ) : session ? (
                // Mobile user menu
                <div className="space-y-2">
                  <div className="px-3 py-2 text-sm text-foreground/70 border-b border-border/30">
                    {session.user?.name || session.user?.email}
                  </div>
                  <Link
                    onClick={() => setOpen(false)}
                    href="/tech-selection"
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-foreground/5"
                  >
                    <User className="h-4 w-4" />
                    Dashboard
                  </Link>
                  <Link
                    onClick={() => setOpen(false)}
                    href="/interview"
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-foreground/5"
                  >
                    <Mic className="h-4 w-4" />
                    Interview
                  </Link>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setOpen(false)
                      handleSignOut()
                    }}
                    className="w-full justify-start gap-2 text-red-600 hover:text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </Button>
                </div>
              ) : (
                // Mobile sign in/up buttons
                <div className="flex items-center gap-2">
                  <Button asChild variant="ghost" className="flex-1">
                    <Link href="/auth/signin">Sign In</Link>
                  </Button>
                  <Button
                    asChild
                    className="flex-1 bg-gradient-to-r from-teal-500 to-blue-500 text-white hover:from-teal-400 hover:to-blue-400"
                  >
                    <Link href="/auth/register">Sign Up</Link>
                  </Button>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
