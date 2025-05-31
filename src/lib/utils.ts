import { env } from "@/env";
import { MessageOptions } from "@/lib/definitions";
import { expandableBlockquote, normal, pre } from "@/lib/tg-format";
import { geolocation, ipAddress } from "@vercel/functions";
import { clsx, type ClassValue } from "clsx";
import { userAgent } from "next/server";
import { twMerge } from "tailwind-merge";

/**
 * Combines and merges CSS class names using clsx and tailwind-merge
 *
 * @param inputs - Array of class names or conditional class objects
 * @returns Merged and optimized class name string
 *
 * @example
 * cn('base-class', { 'conditional-class': true }, ['array-class'])
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Escapes HTML special characters
 *
 * Supports both direct string input and template literal tag
 *
 * @param strings - Input string or template literal array
 * @param values - Values to interpolate when used as template literal tag
 * @returns HTML-escaped string
 *
 * @example
 * html`<div>${userInput}</div>` // Template literal usage
 * html(userInput) // Direct string usage
 */
export function html(text: string): string;
export function html(strings: TemplateStringsArray, values: unknown[]): string;
export function html(
  strings: TemplateStringsArray | string,
  values: unknown[] = [],
): string {
  if (typeof strings === "string") {
    return strings
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }
  return String.raw({ raw: strings }, ...values.map((v) => html(String(v))));
}

/**
 * Generates a cryptographically secure random token
 *
 * Uses the Web Crypto API to ensure high-quality randomness
 *
 * @returns 32-character hexadecimal string token
 */
export function generateRandomToken() {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Sends a message to a Telegram chat using the Telegram Bot API
 *
 * @param chatId - Telegram chat ID to send message to
 * @param message - Message text to send
 * @param options - Additional message options like parse mode and keyboard markup
 * @returns Promise resolving to the Telegram API response
 * @throws Error if message sending fails
 */
export async function sendMessage(
  chatId: number,
  message: string,
  options: MessageOptions = {},
) {
  const response = await fetch(
    `https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "HTML",
        ...options,
      }),
    },
  );

  if (!response.ok) throw new Error("Failed to send message.");

  return await response.json();
}

/**
 * Generates a formatted login information message including device, browser,
 * location and IP address details for security notifications
 *
 * @param req - HTTP Request object containing user agent and location data
 * @param token - Authentication token to include in the message
 * @returns Formatted HTML string with login details
 *
 * @example
 * const loginMessage = getLoginInfo(request, "abc123");
 * await sendMessage(chatId, loginMessage);
 */
export function getLoginInfo(req: Request, token: string) {
  const { browser, os, device } = userAgent(req);
  const geo = geolocation(req);
  const ip = ipAddress(req);

  const location = `${[geo.city, geo.countryRegion, geo.country].filter(Boolean).join(", ")} ${geo.flag || "🌎"}`;

  const deviceInfo = [
    [device.vendor, device.model].filter(Boolean).join(" "),
    [os.name, os.version].filter(Boolean).join(" "),
    [browser.name, browser.version].filter(Boolean).join(" "),
  ]
    .filter(Boolean)
    .join(" · ");

  return expandableBlockquote(
    pre(
      normal`${deviceInfo || "Unknown Device"}\n` +
        normal`IP: ${ip || "Unknown"}\n` +
        normal`Location: ${location}\n` +
        normal`Token: ${token}`,
    ),
  );
}
