import NextAuth, { AuthOptions, SessionStrategy, User as NextAuthUser, DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectToDb } from "@/lib/mongoose";
import { JWT } from "next-auth/jwt";

interface User extends NextAuthUser {
  username: string;
  roleId: string;
}

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      username: string;
      roleId: string;
    }
  }
}

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          console.log("Missing credentials");
          throw new Error('Missing credentials');
        }

        try {
          console.log("Attempting to authenticate user:", credentials.username);
          const db = await connectToDb();
          console.log("Database connected successfully");

          const user = await db.collection("users").findOne({ username: credentials.username });
          console.log("User lookup result:", user ? "User found" : "User not found");

          if (!user) {
            console.log("User not found:", credentials.username);
            throw new Error('Invalid credentials');
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
          console.log("Password validation result:", isPasswordValid ? "Valid" : "Invalid");

          if (!isPasswordValid) {
            console.log("Invalid password for user:", credentials.username);
            throw new Error('Invalid credentials');
          }

          console.log("Login successful for user:", credentials.username);
          return {
            id: user._id.toString(),
            username: user.username,
            roleId: user.roleId
          };
        } catch (error: any) {
          console.error("Authentication error:", {
            message: error.message,
            stack: error.stack
          });
          throw new Error('Invalid credentials');
        }
      },
    }),
  ],

  session: {
    strategy: "jwt" as SessionStrategy,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        console.log("JWT Callback - Adding user data to token");
        token.id = user.id;
        token.username = (user as User).username;
        token.roleId = (user as User).roleId;
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        console.log("Session Callback - Adding token data to session");
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.roleId = token.roleId as string;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  debug: process.env.NODE_ENV === "development",
};

export default NextAuth(authOptions);
