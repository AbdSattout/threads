import { env } from "@/env";
import { geolocation, ipAddress } from "@vercel/functions";
import { clsx, type ClassValue } from "clsx"
import { userAgent } from "next/server";
import { twMerge } from "tailwind-merge"
import { expandableBlockquote, normal, pre } from "@/lib/tg-format";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function html(text: string): string;
export function html(strings: TemplateStringsArray, values: unknown[]): string;
export function html(strings: TemplateStringsArray | string, values: unknown[] = []): string {
  if (typeof strings === "string") {
    return strings
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
  return String.raw({ raw: strings }, ...values.map(v => html(String(v))));
}

export function generateRandomToken() {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array).map(x => x.toString(16).padStart(2, '0')).join('');
}

interface InlineKeyboardButton {
  text: string,
  url: string,
}

interface MessageOptions {
  parse_mode?: 'Markdown' | 'MarkdownV2' | 'HTML';
  reply_markup?: {
    inline_keyboard: InlineKeyboardButton[][];
  };
};

export async function sendMessage(
  chatId: number,
  message: string,
  options: MessageOptions = {}
) {
  const response = await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: 'HTML',
      ...options,
    }),
  });

  if (!response.ok)
    throw new Error('Failed to send message.');

  return await response.json();
}

export function getLoginInfo(req: Request, token: string) {
  const { browser, os, device } = userAgent(req);
  const geo = geolocation(req);
  const ip = ipAddress(req);

  const location = `${[geo.city, geo.countryRegion, geo.country].filter(Boolean).join(", ")} ${geo.flag || "🌎"}`;

  const deviceInfo = [
    [device.vendor, device.model].filter(Boolean).join(" "),
    [os.name, os.version].filter(Boolean).join(" "),
    [browser.name, browser.version].filter(Boolean).join(" "),
  ].filter(Boolean).join(" · ");

  return expandableBlockquote(pre(
    normal`${deviceInfo || "Unknown Device"}\n` +
    normal`IP: ${ip || "Unknown"}\n` +
    normal`Location: ${location}\n` +
    normal`Token: ${token}`
  ));
}