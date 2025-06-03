import { env } from "@/env";
import {
  addUser,
  generateToken,
  removeUserSessions,
  updateUser,
} from "@/lib/db";
import { TelegramUpdate } from "@/lib/definitions";
import { bold, code } from "@/lib/tg-format";
import { sendMessage } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST request handler for Telegram webhook
 * Processes incoming bot commands and manages user authentication flow
 *
 * Supported commands:
 * - /start, /help: Shows welcome message and available commands
 * - /auth: Generates and sends login token
 * - /sync: Updates user profile information
 * - /quit: Terminates all sessions
 *
 * Webhook URL configuration in Telegram Bot API: https://api.telegram.org/botBOT_TOKEN/setWebhook?url=WEBSITE_URL/api/telegram&secret_token=BOT_SECRET
 */
const POST = async (req: NextRequest) => {
  const headers = req.headers;
  const secret = headers.get("X-Telegram-Bot-Api-Secret-Token");

  // Validate the request is coming from Telegram
  if (!secret || secret !== env.BOT_SECRET)
    return new NextResponse("Forbidden", { status: 403 });

  const body = (await req.json()) as TelegramUpdate;

  // Check message structure and ensure it's from a private chat
  if (
    !body.message ||
    !body.message.text ||
    !body.message.chat ||
    body.message.chat.type !== "private"
  )
    return new NextResponse("Ignored", { status: 200 });

  const chatId = body.message.chat.id;
  const id = chatId.toString(16);
  const message = body.message.text;
  const name =
    body.message.chat.first_name +
    (body.message.chat.last_name ? ` ${body.message.chat.last_name}` : "");

  switch (message) {
    case "/start":
    case "/help": {
      await sendMessage(
        chatId,
        `👋 Welcome to ${bold("Threads")}!\n\n` +
          `Available commands:\n` +
          `🔐 /auth - Get your login token\n` +
          `🔄 /sync - Sync your profile with Threads\n` +
          `📖 /help - Show this message\n` +
          `🛑 /quit - Terminate all sessions\n\n` +
          `Start posting, replying, and connecting — all through Threads.`,
      );
      break;
    }

    case "/auth":
    case "/start auth": {
      const user = await addUser(id, name);

      if (!user) {
        await sendMessage(chatId, `🔴 Failed to create an account for you.`);
        break;
      }

      const token = await generateToken(id);

      if (!token) {
        await sendMessage(chatId, `🔴 Failed to generate token.`);
        break;
      }

      await sendMessage(
        chatId,
        `🔑 Your one-time login token:\n\n` +
          `${code(token)}\n\n` +
          `Paste it in the login form, or simply tap the button below.\n\n` +
          `⚠️ Token expires in 10 minutes. Do ${bold("not")} share it with anyone.`,
        {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "Login to Threads",
                  url: `${env.WEBSITE_URL}/login?token=${token}`,
                },
              ],
            ],
          },
        },
      );
      break;
    }

    case "/sync": {
      const user = await updateUser(id, name);

      if (!user) {
        await sendMessage(chatId, `🔴 Failed to sync your profile.`);
        break;
      }

      await sendMessage(
        chatId,
        `✅ Your profile info has been synced with Threads.`,
      );
      break;
    }

    case "/quit": {
      if (await removeUserSessions(id)) {
        await sendMessage(chatId, `🚪 All sessions have been terminated.`);
      } else {
        await sendMessage(chatId, `🔴 Failed to terminate sessions.`);
      }
      break;
    }
  }

  return new NextResponse("OK", { status: 200 });
};

export { POST };
