import NextAuth, { AuthOptions, SessionStrategy, User as NextAuthUser } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";
import { JWT } from "next-auth/jwt";

interface User extends NextAuthUser {
  username: string;
  token: string;
  roleId: string;
}

// Fonction pour obtenir l'URL de base
const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    // Browser should use relative path
    return "";
  }
  
  if (process.env.VERCEL_URL) {
    // Reference for vercel.com
    return `https://${process.env.VERCEL_URL}`;
  }
  
  if (process.env.NEXTAUTH_URL) {
    // Reference for custom domain
    return process.env.NEXTAUTH_URL;
  }
  
  // Assume localhost
  return "http://localhost:3000";
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
        if (!credentials?.username || !credentials?.password) {
          console.log("Missing credentials");
          throw new Error('Missing credentials');
        }

        try {
          console.log("Attempting to authenticate user:", credentials.username);
          const baseUrl = getBaseUrl();
          console.log("Using base URL:", baseUrl);

          const res = await axios.post(
            `${baseUrl}/api/login`,
            {
              username: credentials.username,
              password: credentials.password
            },
            {
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );
          
          console.log("Login API response status:", res.status);
          const user = res.data;

          if (user && user.token) {
            console.log("Login successful for user:", credentials.username);
            return {
              id: user.id,
              username: credentials.username,
              token: user.token,
              roleId: user.roleId
            };
          }
          
          console.log("No user data or token in response");
          return null;
        } catch (error: any) {
          console.error("Authentication error:", {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            url: error.config?.url
          });
          
          if (error.response?.status === 401) {
            throw new Error('Invalid credentials');
          }
          
          throw new Error(error.response?.data?.message || 'Authentication failed');
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
      if (user) {
        console.log("JWT Callback - Adding user data to token");
        token.id = user.id;
        token.username = (user as User).username;
        token.accessToken = (user as User).token;
        token.roleId = (user as User).roleId;
      }
      return token;
    },

    async session({ session, token }: { session: any; token: JWT }) {
      if (token) {
        console.log("Session Callback - Adding token data to session");
        session.user.id = token.id;
        session.user.username = token.username;
        session.accessToken = token.accessToken;
        session.user.roleId = token.roleId;
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
    error: "/login",
  },

  debug: process.env.NODE_ENV === "development",
};

export default NextAuth(authOptions);
