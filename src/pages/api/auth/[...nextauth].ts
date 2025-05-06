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
        console.log("[NextAuth] Authorize attempt with username:", credentials?.username);
        
        if (!credentials?.username || !credentials?.password) {
          console.log("[NextAuth] Missing credentials");
          throw new Error('Veuillez remplir tous les champs');
        }

        try {
          const db = await connectToDb();
          console.log("[NextAuth] Database connected");
          
          // Vérifier si l'utilisateur existe
          const user = await db.collection("users").findOne({ 
            username: credentials.username.toLowerCase().trim() 
          });

          if (!user) {
            console.log("[NextAuth] User not found");
            throw new Error('Utilisateur non trouvé');
          }

          console.log("[NextAuth] User found, verifying password");

          // Vérifier si le mot de passe est correct
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            console.log("[NextAuth] Invalid password");
            throw new Error('Mot de passe incorrect');
          }

          console.log("[NextAuth] Authentication successful for user:", user.username);

          // Retourner les informations de l'utilisateur
          return {
            id: user._id.toString(),
            username: user.username,
            roleId: user.roleId
          };
        } catch (error) {
          console.error("[NextAuth] Error during authentication:", error);
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
    async jwt({ token, user, account }) {
      console.log("[NextAuth] JWT Callback - Token:", token);
      console.log("[NextAuth] JWT Callback - User:", user);
      
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.roleId = user.roleId;
        console.log("[NextAuth] JWT Callback - Updated token:", token);
      }
      return token;
    },

    async session({ session, token }) {
      console.log("[NextAuth] Session Callback - Session:", session);
      console.log("[NextAuth] Session Callback - Token:", token);
      
      if (token) {
        session.user = {
          id: token.id,
          username: token.username,
          roleId: token.roleId
        };
        console.log("[NextAuth] Session Callback - Updated session:", session);
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      console.log("[NextAuth] Redirect Callback - URL:", url);
      console.log("[NextAuth] Redirect Callback - BaseURL:", baseUrl);
      
      // Permettre les redirections vers des URLs relatives
      if (url.startsWith("/")) {
        const finalUrl = `${baseUrl}${url}`;
        console.log("[NextAuth] Redirect Callback - Final URL:", finalUrl);
        return finalUrl;
      }
      // Permettre les redirections vers le même domaine
      else if (new URL(url).origin === baseUrl) {
        console.log("[NextAuth] Redirect Callback - Same domain URL:", url);
        return url;
      }
      console.log("[NextAuth] Redirect Callback - Default to baseUrl:", baseUrl);
      return baseUrl;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
  debug: true, // Activer le mode debug en production

  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        domain: '.vercel.app',
      },
    },
  },
};

export default NextAuth(authOptions);
