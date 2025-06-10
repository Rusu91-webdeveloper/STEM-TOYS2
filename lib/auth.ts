import NextAuth from "next-auth";
import { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { db } from "@/lib/db";
import { compare } from "bcrypt";
import { logger } from "@/lib/logger";
import { hashAdminPassword, verifyAdminPassword } from "@/lib/admin-auth";

// Extended user type that includes our custom fields
interface ExtendedUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  isActive?: boolean;
  role?: string;
}

// Extend the session types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      isActive?: boolean;
      role?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

// Extend the JWT token types
declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    isActive?: boolean;
    role?: string;
  }
}

// Function to create a mock admin user from environment variables
const createMockAdminFromEnv = async () => {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminName = process.env.ADMIN_NAME;

  // Look for hashed password first (preferred), fall back to plaintext
  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail) {
    return null;
  }

  if (adminPasswordHash) {
    // Use the pre-hashed password directly
    return {
      id: "admin_env",
      name: adminName || "Admin User",
      email: adminEmail,
      password: adminPasswordHash,
      isActive: true,
      role: "ADMIN",
      passwordIsHashed: true, // Flag to indicate the password is already hashed
    };
  } else if (adminPassword) {
    // Hash the plaintext password
    logger.warn(
      "Using plaintext ADMIN_PASSWORD from environment variables. Consider using ADMIN_PASSWORD_HASH instead for better security."
    );
    const hashedPassword = await hashAdminPassword(adminPassword);

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

// Initialize auth options
export const authOptions: NextAuthConfig = {
  session: {
    strategy: "jwt",
  },
  // Secure cookie settings
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-next-auth.session-token"
          : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
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
          logger.warn("Missing credentials for login attempt");
          return null;
        }

        try {
          // Find user in database
          let user: any = null;

          // Check if we should use the development admin account
          const isDevelopmentEnv = process.env.NODE_ENV === "development";
          const useEnvAdmin =
            process.env.USE_ENV_ADMIN === "true" || isDevelopmentEnv;

          // Check if admin credentials from environment should be used
          if (useEnvAdmin && credentials.email === process.env.ADMIN_EMAIL) {
            logger.info("Using admin from environment variables");
            const envAdmin = await createMockAdminFromEnv();
            if (envAdmin) {
              user = envAdmin;
            }
          }

          // If no admin user was found or not using environment admin,
          // try to find the user in the database
          if (!user) {
            logger.debug("Looking up user in database", {
              email: credentials.email,
            });
            try {
              user = await db.user.findUnique({
                where: { email: credentials.email },
              });

              if (user) {
                logger.debug("Found user in database", { userId: user.id });
              }
            } catch (dbError) {
              logger.error("Database error during login", dbError);
              return null;
            }
          }

          if (!user) {
            logger.warn("User not found during login attempt", {
              email: credentials.email,
            });
            return null;
          }

          // Verify password
          logger.debug("Checking password for user", { userId: user.id });

          let passwordMatch = false;
          if (user.passwordIsHashed) {
            // Direct comparison for pre-hashed admin password
            passwordMatch = user.password === credentials.password;
          } else if (user.id === "admin_env") {
            // For environment variable admin using our secure hashing
            passwordMatch = await verifyAdminPassword(
              credentials.password,
              user.password as string
            );
          } else {
            // Standard database user with bcrypt hash
            passwordMatch = await compare(
              credentials.password,
              user.password as string
            );
          }

          if (!passwordMatch) {
            logger.warn("Password mismatch during login attempt", {
              userId: user.id,
            });
            return null;
          }

          // Check if user is active (email verified)
          if (!user.isActive) {
            logger.warn("Login attempt with unverified account", {
              userId: user.id,
            });
            throw new Error(
              "Account not verified. Please check your email for verification link."
            );
          }

          logger.info("Authentication successful", {
            userId: user.id,
            role: user.role,
          });

          // Return user without password
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            isActive: user.isActive,
            role: user.role,
          };
        } catch (error) {
          logger.error("Auth error", error);
          throw error;
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub || "";
        session.user.isActive = token.isActive as boolean;
        session.user.role = token.role as string;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.isActive = (user as any).isActive;
        token.role = (user as any).role;
      }
      return token;
    },
  },
  debug: process.env.NODE_ENV === "development",
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  secret: process.env.NEXTAUTH_SECRET || "placeholder-secret-for-development",
};

// For Next Auth v5
export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);
