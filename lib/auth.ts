import NextAuth from "next-auth";
import type { DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { db } from "@/lib/db";
import { compare, hash } from "bcrypt";

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

// Function to create a mock admin user from environment variables
const createMockAdminFromEnv = async () => {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminName = process.env.ADMIN_NAME;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (adminEmail && adminPassword) {
    // Hash the admin password
    const hashedPassword = await hash(adminPassword, 10);

    return {
      id: "admin_env",
      name: adminName || "Admin User",
      email: adminEmail,
      password: hashedPassword,
      isActive: true,
      role: "ADMIN",
    };
  }
  return null;
};

// For development/testing without an actual database
// Export mockUsers so they can be imported and updated by API routes
export const mockUsers = [
  {
    id: "user_1",
    name: "Test User",
    email: "test@example.com",
    password: "$2a$10$lZ1zCDOkW0F6VfW.Vr7Y7.lNzFDLaC5OYqiWSDURcH3TEuStNRQO2", // "password123"
    isActive: true,
    role: "CUSTOMER",
  },
  {
    id: "user_2",
    name: "Admin User",
    email: "admin@example.com",
    password: "$2a$10$lZ1zCDOkW0F6VfW.Vr7Y7.lNzFDLaC5OYqiWSDURcH3TEuStNRQO2", // "password123"
    isActive: true,
    role: "ADMIN",
  },
  {
    id: "user_3",
    name: "Emanuel Rusu",
    email: "rusu.emanuel.webdeveloper@gmail.com",
    password: "$2a$10$lZ1zCDOkW0F6VfW.Vr7Y7.lNzFDLaC5OYqiWSDURcH3TEuStNRQO2", // "password123"
    isActive: true,
    role: "CUSTOMER",
  },
];

// Initialize auth options
export const authOptions = {
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
          console.log("Missing credentials");
          return null;
        }

        try {
          // Find user in database
          let user;
          let mockUser;

          // Force mock data mode if not explicitly set
          const useMockData =
            process.env.USE_MOCK_DATA === "true" ||
            process.env.NODE_ENV === "development";

          // First, try to find a mock user if we're in development mode
          if (useMockData) {
            console.log("Checking mock data for authentication");

            // Check if the credentials match our environment-based admin
            if (credentials.email === process.env.ADMIN_EMAIL) {
              // Create the admin user on the fly
              const envAdmin = await createMockAdminFromEnv();
              if (envAdmin) {
                console.log("Using admin from environment variables");
                mockUser = envAdmin;
              }
            } else {
              // Regular mock user
              mockUser = mockUsers.find((u) => u.email === credentials.email);
            }

            if (mockUser) {
              console.log("Found user in mock data");
              user = mockUser;
            }
          }

          // If no mock user was found or we're not in mock data mode, try the database
          if (!user) {
            console.log(
              `Looking up user with email in database: ${credentials.email}`
            );
            try {
              user = await db.user.findUnique({
                where: { email: credentials.email },
              });

              if (user) {
                console.log("Found user in database");
              }
            } catch (dbError) {
              console.error("Database error:", dbError);
              // If DB error and we have a mock user, use that instead
              if (mockUser) {
                user = mockUser;
              }
            }
          }

          if (!user) {
            console.log("User not found in mock data or database");
            return null;
          }

          // Verify password
          console.log("Checking password...");
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
            console.log("User account not verified");
            throw new Error(
              "Account not verified. Please check your email for verification link."
            );
          }

          console.log("Authentication successful");
          // Return user without password
          return {
            id: user.id,
            name: user.name,
            email: user.email,
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
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub;
        session.user.isActive = token.isActive;
        session.user.role = token.role;
      }
      return session;
    },
    async jwt({ token, user, account }) {
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
  debug: process.env.NODE_ENV === "development",
  pages: {
    signIn: "/auth/login",
    signUp: "/auth/register",
    error: "/auth/error",
  },
  secret: process.env.NEXTAUTH_SECRET || "placeholder-secret-for-development",
};

// For Next Auth v5
export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);
