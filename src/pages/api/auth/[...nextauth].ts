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

// Fonction pour vérifier si un hash est valide
const isValidBcryptHash = (hash: string) => {
  return /^\$2[aby]\$\d+\$/.test(hash);
};

// Fonction pour hasher un mot de passe
const hashPassword = async (password: string) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

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

          const username = credentials.username.toLowerCase().trim();
          const password = credentials.password.trim();

          console.log("Connecting to database...");
          const db = await connectToDb();
          console.log("Database connected successfully");
          
          // Vérifier si l'utilisateur existe
          const user = await db.collection("users").findOne({ username });
          console.log("User lookup result:", user ? "User found" : "User not found");

          if (!user) {
            console.log("User not found:", username);
            throw new Error('Utilisateur non trouvé');
          }

          if (!user.password) {
            console.log("No password hash found for user");
            throw new Error('Erreur de configuration du compte');
          }

          console.log("Stored password hash:", user.password);

          // Si le mot de passe n'est pas hashé avec bcrypt, le hasher et mettre à jour la base de données
          if (!isValidBcryptHash(user.password)) {
            console.log("Password is not hashed with bcrypt, updating...");
            const hashedPassword = await hashPassword(user.password);
            await db.collection("users").updateOne(
              { _id: user._id },
              { $set: { password: hashedPassword } }
            );
            console.log("Password has been updated with bcrypt hash");
            user.password = hashedPassword;
          }

          console.log("Attempting to verify password...");

          try {
            // Vérifier si le mot de passe est correct
            const isPasswordValid = await bcrypt.compare(password, user.password);
            console.log("Password verification result:", isPasswordValid);

            if (!isPasswordValid) {
              console.log("Invalid password for user:", username);
              throw new Error('Mot de passe incorrect');
            }

            console.log("Authentication successful for user:", username);

            // Retourner les informations de l'utilisateur
            const userData = {
              id: user._id.toString(),
              username: user.username,
              roleId: user.roleId
            };
            
            console.log("Returning user data:", userData);
            return userData;

          } catch (bcryptError) {
            console.error("Bcrypt comparison error:", bcryptError);
            throw new Error('Erreur lors de la vérification du mot de passe');
          }

        } catch (error) {
          console.error("Authentication error details:", {
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
            type: error instanceof Error ? error.constructor.name : typeof error
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
      console.log("Redirect callback - URL:", url);
      console.log("Redirect callback - BaseURL:", baseUrl);
      
      // Si l'URL est relative, l'ajouter à la base URL
      if (url.startsWith("/")) {
        const finalUrl = `${baseUrl}${url}`;
        console.log("Redirecting to:", finalUrl);
        return finalUrl;
      }
      
      // Si l'URL est sur le même domaine, l'autoriser
      if (new URL(url).origin === baseUrl) {
        console.log("Redirecting to same domain:", url);
        return url;
      }
      
      // Par défaut, rediriger vers le dashboard
      console.log("Redirecting to default:", `${baseUrl}/dashboard`);
      return `${baseUrl}/dashboard`;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
  debug: true,
};

export default NextAuth(authOptions);
