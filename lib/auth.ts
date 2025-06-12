import NextAuth from "next-auth";
import { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { z } from "zod";
import { compare } from "bcrypt";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";
import { hashAdminPassword, verifyAdminPassword } from "@/lib/admin-auth";
import { withRetry, verifyUserExists } from "@/lib/db-helpers";

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
    async signIn({ user, account, profile }) {
      if (account?.provider === "google" && profile?.email) {
        try {
          // Check if user already exists - with retries
          let existingUser = null;
          try {
            existingUser = await withRetry(
              () =>
                db.user.findUnique({
                  where: { email: profile.email! },
                }),
              {
                name: "Find Google user",
                maxRetries: 3,
                delayMs: 300,
                logParams: { email: profile.email },
              }
            );
          } catch (findError) {
            logger.error("Error finding existing user", {
              error:
                findError instanceof Error
                  ? findError.message
                  : String(findError),
              email: profile.email,
            });
          }

          if (existingUser) {
            // Update existing user with retry logic
            await withRetry(
              () =>
                db.user.update({
                  where: { id: existingUser!.id },
                  data: {
                    name: profile.name || existingUser!.name,
                    isActive: true, // Ensure Google-authenticated users are active
                    emailVerified: new Date(),
                  },
                }),
              {
                name: "Update Google user",
                maxRetries: 5,
                delayMs: 300,
                logParams: { userId: existingUser.id, email: profile.email },
              }
            );

            logger.info("Updated existing user from Google login", {
              userId: existingUser.id,
              email: profile.email,
            });

            // Store the user ID to be used in the JWT callback
            if (user) {
              user.id = existingUser.id;
            }
          } else {
            // Create new user for Google authentication using retry logic
            let newUser: any;
            try {
              newUser = await withRetry(
                () =>
                  db.user.create({
                    data: {
                      email: profile.email!,
                      name: profile.name ?? "Google User",
                      // For Google users, we don't need a password since they authenticate via Google
                      password: "", // Empty password for Google users
                      isActive: true, // Google-authenticated users are verified by default
                      emailVerified: new Date(),
                      role: "CUSTOMER", // Use the enum value from the Prisma schema
                    },
                  }),
                {
                  name: "Create Google user",
                  maxRetries: 5,
                  delayMs: 300,
                  logParams: { email: profile.email },
                }
              );

              logger.info("Created new user from Google login", {
                userId: newUser.id,
                email: profile.email,
              });

              // Store the user ID to be used in the JWT callback
              if (user) {
                user.id = newUser.id;
              }

              // Double check user exists right after creation
              const verifyCreation = await withRetry(
                () =>
                  db.user.findUnique({
                    where: { id: newUser.id },
                    select: { id: true },
                  }),
                {
                  name: "Verify Google user creation",
                  maxRetries: 3,
                  delayMs: 300,
                  logParams: { userId: newUser.id, email: profile.email },
                }
              );

              if (!verifyCreation) {
                logger.error(
                  "User created but not found in verification check",
                  {
                    userId: newUser.id,
                    email: profile.email,
                  }
                );
                return false;
              }
            } catch (createError) {
              logger.error("Failed to create user after multiple attempts", {
                error:
                  createError instanceof Error
                    ? createError.message
                    : String(createError),
                email: profile.email,
              });
              return false;
            }
          }

          // Force a delay to ensure database operations complete
          await new Promise((resolve) => setTimeout(resolve, 1500));
        } catch (error) {
          logger.error("Error in Google sign-in flow", {
            error: error instanceof Error ? error.message : String(error),
            email: profile.email,
          });
          return false; // Prevent sign-in on database error
        }
      }

      return true; // Allow sign-in
    },
    async session({ session, token }) {
      // Assign token data to session
      if (token) {
        session.user.id = token.id || token.sub || "";
        session.user.isActive = token.isActive || false;
        session.user.role = token.role || "CUSTOMER";

        // For middleware and API routes, add token data to session
        // This makes googleAuthTimestamp accessible in the middleware
        (session as any).token = {
          googleAuthTimestamp: token.googleAuthTimestamp,
        };
      }

      // Skip database verification for fresh Google auth sessions
      // This gives time for the user creation in the database to complete
      const isRecentGoogleAuth =
        token.googleAuthTimestamp &&
        Date.now() - (token.googleAuthTimestamp as number) < 120000; // 2 minute grace period (increased)

      if (isRecentGoogleAuth) {
        logger.info("Bypassing database check for fresh Google auth session", {
          userId: session.user.id,
        });
        return session;
      }

      // Verify that the user still exists in the database using our retry helper
      try {
        if (session.user.id) {
          const userExists = await verifyUserExists(session.user.id, {
            maxRetries: 3,
            delayMs: 500,
          });

          // If user doesn't exist in database, invalidate the session
          if (!userExists) {
            logger.warn("Session requested for deleted user", {
              userId: session.user.id,
            });
            // Set an error flag so middleware can detect and handle this
            return {
              ...session,
              user: {
                ...session.user,
                error: "UserNotFound",
              },
              expires: "0",
            };
          }
        }
      } catch (error) {
        logger.error("Error verifying user existence during session", {
          error: error instanceof Error ? error.message : String(error),
          userId: session.user?.id,
        });
        // Continue in case of database error to avoid blocking access
      }

      return session;
    },
    async jwt({ token, user, account, profile }) {
      // If the user has just signed in, add their database id to the token
      if (user) {
        token.id = user.id;
        // Use type assertion to handle the custom fields safely
        const extendedUser = user as ExtendedUser;
        token.isActive = extendedUser.isActive || false;
        token.role = extendedUser.role || "CUSTOMER";

        // For Google auth, add a timestamp when the user is created/updated
        // This helps identify fresh Google auth sessions
        if (account?.provider === "google") {
          token.googleAuthTimestamp = Date.now();
        }
      }
      return token;
    },
  },
  debug: process.env.NODE_ENV === "development",
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  secret:
    process.env.NEXTAUTH_SECRET ||
    "935925a21cc9c5f18fbec20510b9655211e16f4f06ba63c23e7b45862bd6cc9e",
};

// For Next Auth v5
export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);

// Mock users for development purposes
export const mockUsers = [
  {
    id: "mock_user_1",
    name: "Test User",
    email: "test@example.com",
    password: "$2a$12$QduVQePXgFInw8z.j1bBXuwxQPKVzxS4j9FWXD1Afxy3NQbIBMSqy", // hashed 'Password123'
    isActive: true,
    role: "CUSTOMER",
  },
  {
    id: "mock_admin",
    name: "Admin User",
    email: "admin@example.com",
    password: "$2a$12$QduVQePXgFInw8z.j1bBXuwxQPKVzxS4j9FWXD1Afxy3NQbIBMSqy", // hashed 'Password123'
    isActive: true,
    role: "ADMIN",
  },
];
