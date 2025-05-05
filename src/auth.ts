import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import db from "@/db";
import { z } from "zod";
import { tokens } from "@/db/schema";
import { eq } from "drizzle-orm";
import { after } from "next/server";
import { getLoginInfo, sendMessage } from "@/lib/utils";
import { bold } from "./lib/tg-format";

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
        const parsed = z.object({
          token: z.string().length(45),
        }).safeParse(credentials);

        if (!parsed.success) return null;

        const token = await db.query.tokens.findFirst({
          where: (tokens, { eq, and, gt }) => and(eq(tokens.token, parsed.data.token), gt(tokens.expiresAt, new Date())),
          with: {
            user: true,
          },
        });

        if (!token) return null;

        const { user } = token;

        after(async () => {
          const info = getLoginInfo(req, token.token);

          await sendMessage(
            parseInt(user.id, 16),
            `✅ You've successfully logged in to ${bold('Threads')}!\n\n${info}`
          );
        });

        await db.delete(tokens).where(eq(tokens.id, token.id));

        return user;
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    signOut: "/logout",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (!token?.id) return session;
      const user = await db.query.users.findFirst({ where: (users, { eq }) => eq(users.id, token.id as string) });
      if (!user) return session;
      return {
        ...session,
        user: {
          ...session.user,
          id: user.id,
          name: user.name,
        }
      }
    },
  },
});
