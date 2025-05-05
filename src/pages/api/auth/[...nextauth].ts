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
        if (!credentials?.username || !credentials?.password) {
          throw new Error('Veuillez remplir tous les champs');
        }

        try {
          const db = await connectToDb();
          
          // Vérifier si l'utilisateur existe
          const user = await db.collection("users").findOne({ 
            username: credentials.username.toLowerCase().trim() 
          });

          if (!user) {
            throw new Error('Utilisateur non trouvé');
          }

          // Vérifier si le mot de passe est correct
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            throw new Error('Mot de passe incorrect');
          }

          // Retourner les informations de l'utilisateur
          return {
            id: user._id.toString(),
            username: user.username,
            roleId: user.roleId
          };
        } catch (error) {
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
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

export default NextAuth(authOptions);
