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
            return {
              token: user.token,
              username: credentials.username,
              id: user.id, // 🔥 Ajoute l'ID ici
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
  callbacks: {
    async jwt({ token, user }) {
      console.log("JWT Callback - Token:", token, "User:", user);
      if (user) {
        token.token = user.token;
        token.username = user.username;
        token.id = user.id || token.id; // 🔥 Vérifie bien que `id` est transmis
      }
      return token;
    },
    async session({ session, token }) {
      console.log("Session Callback - Session:", session, "Token:", token);
      session.user.token = token.token;
      session.user.username = token.username;
      session.user.id = token.id || null; // 🔥 Vérifie bien que `id` est transmis
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
};

export default NextAuth(authOptions);
