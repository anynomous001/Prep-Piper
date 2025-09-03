import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req: any) => {
  const { pathname } = req.nextUrl
  const session = req.auth
  const isLoggedIn = !!session

  // Redirect authenticated users away from auth pages
  if (isLoggedIn && pathname.startsWith("/auth/signin")) {
    return NextResponse.redirect(new URL("/", req.url))
  }

  // Protect routes for unauthenticated users
  if (!session && (pathname.startsWith("/tech-selection") || pathname.startsWith("/interview"))) {
    const signInUrl = new URL("/auth/signin", req.url)
    signInUrl.searchParams.set("callbackUrl", req.url)
    return NextResponse.redirect(signInUrl)
  }

  // Handle unapproved users
  if (session && !session.user?.approved) {
    if (pathname === "/auth/pending-approval") {
      return NextResponse.next()
    }
    if (pathname.startsWith("/tech-selection") || pathname.startsWith("/interview")) {
      return NextResponse.redirect(new URL("/auth/pending-approval", req.url))
    }
  }

  // Redirect approved users away from pending approval
  if (session && session.user?.approved && pathname === "/auth/pending-approval") {
    return NextResponse.redirect(new URL("/", req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
