import { getTokenWithUser, getUser, revokeToken } from "@/lib/db";
import { bold } from "@/lib/tg-format";
import { getLoginInfo, sendMessage } from "@/lib/utils";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { after } from "next/server";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      id: "telegram",
      name: "Telegram",
      credentials: {
        token: {
          type: "text",
          label: "Token",
          placeholder: "abcdefghijklmnopqrstuvwxyz",
        },
      },
      authorize: async (credentials, req) => {
        if (!credentials.token || typeof credentials.token !== "string")
          return null;

        const token = await getTokenWithUser(credentials.token);

        if (!token) return null;

        const { user } = token;

        // Schedule post-authentication tasks
        after(async () => {
          const info = getLoginInfo(req, token.token);

          // Send Telegram notification about successful login
          await sendMessage(
            parseInt(user.id, 16),
            `✅ You've successfully logged in to ${bold("Threads")}!\n\n${info}`,
          );

          // Invalidate used token
          await revokeToken(token.token);
        });

        return user;
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (!token?.id) return session;
      const user = await getUser(token.id as string);
      if (!user) return session;
      return {
        ...session,
        user: {
          ...session.user,
          id: user.id,
          name: user.name,
        },
      };
    },
  },
});
