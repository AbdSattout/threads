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

export async function sendMessage(chatId: number, message: string) {
  const response = await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: 'HTML',
    }),
  });

  if (!response.ok)
    throw new Error('Failed to send message.');

  return await response.json();
}

export function getRequestInfo(req: Request, token: string) {
  const { browser, os, device } = userAgent(req);
  const geo = geolocation(req);
  const ip = ipAddress(req);

  return expandableBlockquote(pre(
    normal`Device: ${device.vendor || "Unknown"} ${device.model || ""}\n` +
    normal`OS: ${os.name || "Unknown"} ${os.version || ""}\n` +
    normal`Browser: ${browser.name || "Unknown"} ${browser.version || ""}\n` +
    normal`IP: ${ip || "Unknown"}\n` +
    normal`Location: ${geo.city || "?"}, ${geo.region || "?"}, ${geo.country || "?"}\n` +
    normal`Token: ${token}`
  ));
}