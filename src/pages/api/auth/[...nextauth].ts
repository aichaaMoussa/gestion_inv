import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const res = await axios.post(
            "http://localhost:3000/api/login",
            credentials
          );
          const user = res.data;

          if (user && user.token) {
            console.log("Login Success - User:", user);
            return {
              token: user.token,
              username: credentials.username,
              id: user.id,
            };
          }
          return null;
        } catch (error) {
          console.error("Login error:", error.response?.data || error.message);
          return null;
        }
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user }) {
      console.log(
        "JWT Callback - Avant Mise à Jour - Token:",
        token,
        "User:",
        user
      );
      if (user) {
        token.token = user.token;
        token.username = user.username;
        token.id = user.id;
      }
      console.log("JWT Callback - Après Mise à Jour - Token:", token);
      return token;
    },

    async session({ session, token }) {
      console.log(
        "Session Callback - Avant Mise à Jour - Session:",
        session,
        "Token:",
        token
      );
      session.user = {
        ...session.user,
        token: token.token,
        username: token.username,
        id: token.id,
      };
      console.log("Session Callback - Après Mise à Jour - Session:", session);
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
};

export default NextAuth(authOptions);
