import { getTokenWithUser, getUser, revokeToken } from "@/lib/db";
import { bold } from "@/lib/tg-format";
import { getLoginInfo, sendMessage } from "@/lib/utils";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { after } from "next/server";
import { z } from "zod";

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
        const parsed = z
          .object({
            token: z.string().length(45),
          })
          .safeParse(credentials);

        if (!parsed.success) return null;

        const token = await getTokenWithUser(parsed.data.token);

        if (!token) return null;

        const { user } = token;

        after(async () => {
          const info = getLoginInfo(req, token.token);

          await sendMessage(
            parseInt(user.id, 16),
            `✅ You've successfully logged in to ${bold("Threads")}!\n\n${info}`,
          );

          await revokeToken(parsed.data.token);
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
