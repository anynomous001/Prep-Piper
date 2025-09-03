import type { DefaultSession, DefaultUser } from "next-auth"
import type { DefaultJWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      approved: boolean
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    approved: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    approved: boolean
  }
}
