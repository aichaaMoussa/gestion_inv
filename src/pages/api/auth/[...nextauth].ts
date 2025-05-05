import NextAuth, { AuthOptions, SessionStrategy, User as NextAuthUser } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";
import { JWT } from "next-auth/jwt";

interface User extends NextAuthUser {
  username: string;
  token: string;
  roleId: string;
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
          throw new Error('Missing credentials');
        }

        try {
          const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
          const res = await axios.post(
            `${baseUrl}/api/login`,
            {
              username: credentials.username,
              password: credentials.password
            }
          );
          const user = res.data;

          if (user && user.token) {
            console.log("Login Success - User:", user);
            return {
              id: user.id,
              username: credentials.username,
              token: user.token,
              roleId: user.roleId
            };
          }
          return null;
        } catch (error: any) {
          console.error("Login error:", error.response?.data || error.message);
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
        token.id = user.id;
        token.username = (user as User).username;
        token.accessToken = (user as User).token;
        token.roleId = (user as User).roleId;
      }
      return token;
    },

    async session({ session, token }: { session: any; token: JWT }) {
      if (token) {
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
