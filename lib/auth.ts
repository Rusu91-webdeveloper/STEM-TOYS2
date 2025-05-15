import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { db } from "./db";
import NextAuth from "next-auth";
// In a real implementation, we would use the Prisma client here
// import { prisma } from "./prisma";

// Since we're just implementing a placeholder auth system, we'll use
// a simple in-memory mock for users
const MOCK_USERS = new Map([
  [
    "user@example.com",
    {
      id: "1",
      name: "Demo User",
      email: "user@example.com",
      // In a real app, this would be a hashed password
      password: "password123",
    },
  ],
]);

export const authOptions: NextAuthOptions = {
  // In a real app, we would use the Prisma adapter
  // adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  // Add providers for authentication
  providers: [
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

        // In a real app, we would fetch the user from the database
        // const user = await prisma.user.findUnique({
        //   where: { email: credentials.email },
        // });

        // Using our mock user data instead
        const user = MOCK_USERS.get(credentials.email);

        if (!user || user.password !== credentials.password) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
        };
      },
    }),
    // Add more providers as needed (Google, GitHub, etc.)
  ],
  callbacks: {
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    // Other custom pages can be added here
  },
  // Secret used to encrypt cookies - in production, use the environment variable
  secret: process.env.NEXTAUTH_SECRET || "placeholder-secret-for-development",
};

// For Next Auth v5
export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);
