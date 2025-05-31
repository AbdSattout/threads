import { env } from "@/env";
import { MessageOptions } from "@/lib/definitions";
import { expandableBlockquote, normal, pre } from "@/lib/tg-format";
import { clsx, type ClassValue } from "clsx";
import { userAgentFromString } from "next/server";
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
 * @param bytes - Number of random bytes to generate (default: 16)
 * @returns Hexadecimal string token
 */
export function generateRandomToken(bytes: number = 16) {
  const array = new Uint8Array(bytes);
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
 * Extracts and formats device information from HTTP headers
 *
 * Parses the user-agent string to identify device, operating system and browser details
 *
 * @param headers - HTTP Headers object containing the user-agent string
 * @returns Formatted string with device, OS and browser information, or "Unknown Device" if not available
 *
 * @example
 * const deviceDetails = getDeviceInfo(request.headers);
 * // Returns something like: "iPhone 12 · iOS 15.0 · Safari 15.0"
 */
export function getDeviceInfo(headers: Headers) {
  const { browser, os, device } = userAgentFromString(
    headers.get("user-agent") ?? "",
  );

  const deviceInfo = [
    [device.vendor, device.model].filter(Boolean).join(" "),
    [os.name, os.version].filter(Boolean).join(" "),
    [browser.name, browser.version].filter(Boolean).join(" "),
  ]
    .filter(Boolean)
    .join(" · ");

  return deviceInfo || "Unknown Device";
}

/**
 * Generates a formatted login information message including device, browser,
 * location and IP address details for security notifications
 *
 * @param headers - HTTP Headers object containing user agent and location data
 * @param token - Authentication token to include in the message
 * @returns Formatted HTML string with login details
 *
 * @example
 * const loginMessage = getLoginInfo(request.headers, "abc123");
 * await sendMessage(chatId, loginMessage);
 */
export function getLoginInfo(headers: Headers, token: string) {
  // Get geolocation data directly from headers
  const city = headers.get("x-vercel-ip-city")
    ? decodeURIComponent(headers.get("x-vercel-ip-city") ?? "")
    : undefined;
  const country = headers.get("x-vercel-ip-country");
  const countryRegion = headers.get("x-vercel-ip-country-region");
  const ip = headers.get("x-real-ip");

  // Generate country flag emoji if country code exists
  let flag: string | undefined;
  if (country && /^[A-Z]{2}$/.test(country)) {
    flag = String.fromCodePoint(
      ...country.split("").map((char) => 127397 + char.charCodeAt(0)),
    );
  }

  const location = `${[city, countryRegion, country]
    .filter(Boolean)
    .join(", ")} ${flag || "🌎"}`;
  const deviceInfo = getDeviceInfo(headers);

  return expandableBlockquote(
    pre(
      normal`${deviceInfo}\n` +
        normal`IP: ${ip || "Unknown"}\n` +
        normal`Location: ${location}\n` +
        normal`Token: ${token}`,
    ),
  );
}
