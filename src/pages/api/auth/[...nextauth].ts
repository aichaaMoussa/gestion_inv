import NextAuth, { AuthOptions, SessionStrategy, User as NextAuthUser, DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectToDb } from "@/lib/mongoose";

// Extend the built-in session types
declare module "next-auth" {
  interface User {
    id: string;
    username: string;
    roleId: string;
  }

  interface Session extends DefaultSession {
    user: User;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    username: string;
    roleId: string;
  }
}

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error("NEXTAUTH_SECRET is not defined in environment variables");
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
        try {
          console.log("Starting authentication process...");
          
          if (!credentials?.username || !credentials?.password) {
            console.log("Missing credentials");
            throw new Error('Veuillez remplir tous les champs');
          }

          console.log("Connecting to database...");
          const db = await connectToDb();
          console.log("Database connected successfully");
          
          // Vérifier si l'utilisateur existe
          const user = await db.collection("users").findOne({ 
            username: credentials.username.toLowerCase().trim() 
          });

          if (!user) {
            console.log("User not found:", credentials.username);
            throw new Error('Utilisateur non trouvé');
          }

          console.log("User found, stored password hash:", user.password);
          console.log("Attempting to verify password...");

          // Vérifier si le mot de passe est correct
          const isPasswordValid = await bcrypt.compare(
            credentials.password.trim(),
            user.password
          );

          console.log("Password verification result:", isPasswordValid);

          if (!isPasswordValid) {
            console.log("Invalid password for user:", credentials.username);
            throw new Error('Mot de passe incorrect');
          }

          console.log("Authentication successful for user:", user.username);

          // Retourner les informations de l'utilisateur
          const userData = {
            id: user._id.toString(),
            username: user.username,
            roleId: user.roleId
          };
          
          console.log("Returning user data:", userData);
          return userData;

        } catch (error) {
          console.error("Authentication error details:", {
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
          });
          
          if (error instanceof Error) {
            throw new Error(error.message);
          }
          throw new Error('Une erreur est survenue lors de l\'authentification');
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
        token.id = user.id;
        token.username = user.username;
        token.roleId = user.roleId;
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id,
          username: token.username,
          roleId: token.roleId
        };
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      } else if (new URL(url).origin === baseUrl) {
        return url;
      }
      return baseUrl;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
  debug: true, // Enable debug mode to see more detailed logs
};

export default NextAuth(authOptions);
