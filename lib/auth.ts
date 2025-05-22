import NextAuth, { DefaultSession, NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { db } from "@/lib/db";
import { compare } from "bcrypt";
import { JWT } from "next-auth/jwt";

// Extend the session types
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      isActive?: boolean;
      role?: string;
    } & DefaultSession["user"];
  }
}

// Remove the mock users since we're using a database now

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "placeholder-client-id",
      clientSecret:
        process.env.GOOGLE_CLIENT_SECRET || "placeholder-client-secret",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Find user in database
          const user = await db.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user) {
            console.log("User not found");
            return null;
          }

          // Verify password
          const passwordMatch = await compare(
            credentials.password,
            user.password
          );

          if (!passwordMatch) {
            console.log("Password doesn't match");
            return null;
          }

          // Check if user is active (email verified)
          if (!user.isActive) {
            throw new Error(
              "Account not verified. Please check your email for verification link."
            );
          }

          // Return user without password
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: null,
            isActive: user.isActive,
            role: user.role,
          };
        } catch (error) {
          console.error("Auth error:", error);
          throw error;
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, token }: { session: any; token: any }) {
      if (token) {
        session.user.id = token.sub;
        session.user.isActive = token.isActive;
        session.user.role = token.role;
      }
      return session;
    },
    async jwt({
      token,
      user,
      account,
    }: {
      token: any;
      user: any;
      account: any;
    }) {
      if (user) {
        token.id = user.id;
        token.isActive = user.isActive;
        token.role = user.role;
      }
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
  },
  pages: {
    signIn: "/auth/login",
    signUp: "/auth/register",
    error: "/auth/error",
  },
  secret: process.env.NEXTAUTH_SECRET || "placeholder-secret-for-development",
};

// For Next Auth v5
export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);
