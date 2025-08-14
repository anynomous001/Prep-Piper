import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req:any) => {
  const { pathname } = req.nextUrl
  const session = req.auth
      const isLoggedIn = !!req.auth


  // If user is not authenticated and trying to access protected routes
  if (!session && (pathname.startsWith("/tech-selection") || pathname.startsWith("/interview"))) {
    const signInUrl = new URL("/auth/signin", req.url)
    signInUrl.searchParams.set("callbackUrl", req.url)
    return NextResponse.redirect(signInUrl)
  }

  // If user is authenticated but not approved
  if (session && !session.user?.approved) {
    // Allow access to pending approval page
    if (pathname === "/auth/pending-approval") {
      return NextResponse.next()
    }

    // Redirect unapproved users to pending approval page
    if (pathname.startsWith("/tech-selection") || pathname.startsWith("/interview")) {
      return NextResponse.redirect(new URL("/auth/pending-approval", req.url))
    }
  }

  // If user is approved and trying to access pending approval page, redirect to home
  if (session && session.user?.approved && pathname === "/auth/pending-approval") {
    return NextResponse.redirect(new URL("/", req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
