// lib/auth.ts
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
//@ts-ignore
import type { AuthOptions } from "next-auth"

const getApprovedEmails = (): string[] =>
  (process.env.APPROVED_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)

console.log("Approved Emails:", getApprovedEmails())
console.log("Raw Approved Emails:", process.env.APPROVED_EMAILS)


export const authOptions: AuthOptions = {
  providers: [
    Credentials({
    id: "credentials", // Add explicit ID
      name: "Email",
      credentials: { email: { label: "Email", type: "email" } },
      async authorize(credentials: Partial<Record<"email", unknown>>) {
        const email = typeof credentials?.email === "string" ? credentials.email.toLowerCase() : undefined
        if (!email) return null
        const approved = getApprovedEmails().includes(email)
        return { id: email, email, name: email.split("@")[0], approved }
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    jwt({ token, user }: { token: any; user?: any }) {
      if (user) token.approved = (user as any).approved
      return token
    },
    session({ session, token }: { session: any; token: any }) {
      if (session.user) session.user.approved = token.approved as boolean
      return session
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
}

export const { handlers, signIn, signOut, auth } = NextAuth(authOptions)
