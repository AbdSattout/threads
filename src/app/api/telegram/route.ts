import { signIn } from "@/auth";
import db from "@/db";
import { tokens, users } from "@/db/schema";
import { env } from "@/env";
import { bold, code, link } from "@/lib/tg-format";
import { generateRandomToken, sendMessage } from "@/lib/utils";
import { AuthError } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

const GET = async (req: NextRequest) => {
  const params = req.nextUrl.searchParams;
  const token = params.get("token");
  if (!token) return new NextResponse("Missing token", { status: 400 });

  try {
    await signIn("telegram", { token, redirectTo: "/" });
  } catch (e) {
    if (e instanceof AuthError)
      return new NextResponse("Invalid or expired token", { status: 400 });
    throw e;
  }
};

const POST = async (req: NextRequest) => {
  const headers = req.headers;
  const secret = headers.get("X-Telegram-Bot-Api-Secret-Token");

  if (!secret || secret !== env.BOT_SECRET) return new NextResponse("Forbidden", { status: 403 });

  const body = await req.json();

  if (!body.message || !body.message.text || !body.message.chat || body.message.chat.type !== 'private')
    return new NextResponse("Ignored", { status: 200 });

  const chatId = body.message.chat.id as number;
  const id = chatId.toString(16);
  const message = body.message.text;
  const name = body.message.chat.first_name + (body.message.chat.last_name ? ` ${body.message.chat.last_name}` : '');

  switch (message) {
    case '/start':
    case '/help': {
      await sendMessage(
        chatId,
        `👋 Welcome to ` + bold('Threads') + `!\n\n` +
        `Available commands:\n` +
        `/auth - 🔐 Get your login token\n` +
        `/sync - 🔄 Sync your profile with Threads\n` +
        `/help - 📄 Show this message\n\n` +
        `Start posting, replying, and connecting — all through Threads.`
      );
      break;
    }

    case '/auth':
    case '/start auth': {
      await db.insert(users).values({ id, name }).onConflictDoNothing();

      const token = generateRandomToken() + id.padStart(13, '0');

      await db.insert(tokens).values({
        id,
        token,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      }).onConflictDoUpdate({
        target: tokens.id,
        set: { token },
      });

      await sendMessage(
        chatId,
        `🔑 Your one-time login token:\n\n` +
        code(token) + `\n\n` +
        `Paste it in the login form, or simply tap ${link(`${env.WEBSITE_URL}/api/telegram?token=${token}`, 'here')}.\n\n` +
        `⚠️ Token expires in 10 minutes. Do ${bold('not')} share it with anyone.`
      );
      break;
    }

    case '/sync': {
      await db.insert(users).values({ id, name }).onConflictDoUpdate({
        target: users.id,
        set: { name },
      });

      await sendMessage(
        chatId,
        `✅ Your profile info has been synced with Threads.`
      );
      break;
    }
  }

  return new NextResponse("OK", { status: 200 });
};

export { GET, POST };