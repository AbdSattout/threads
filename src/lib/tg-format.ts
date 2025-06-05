import { html } from "@/lib/utils";

/**
 * Formats text without any special styling, escaping HTML characters
 * @param strings - Template literal or string to format
 * @param values - Values to interpolate if using template literal
 * @returns HTML-escaped string
 */
export function normal(
  strings: TemplateStringsArray,
  ...values: unknown[]
): string {
  return html(strings, values);
}

/**
 * Formats text in bold using HTML <b> tags
 * @param text - Text to format or template literal
 * @param values - Values to interpolate if using template literal
 * @returns Bold-formatted text
 * @example bold("Important message")
 * @example bold`User ${username} connected`
 */
export function bold(text: string): string;
export function bold(
  strings: TemplateStringsArray,
  ...values: unknown[]
): string;
export function bold(
  strings: TemplateStringsArray | string,
  ...values: unknown[]
): string {
  if (typeof strings === "string") {
    return `<b>${strings}</b>`;
  }
  return bold(html(strings, values));
}

/**
 * Formats text as inline code using HTML <code> tags
 * @param text - Text to format or template literal
 * @param values - Values to interpolate if using template literal
 * @returns Code-formatted text
 * @example code("npm install")
 * @example code`Version: ${version}`
 */
export function code(text: string): string;
export function code(
  strings: TemplateStringsArray,
  ...values: unknown[]
): string;
export function code(
  strings: TemplateStringsArray | string,
  ...values: unknown[]
): string {
  if (typeof strings === "string") {
    return `<code>${strings}</code>`;
  }
  return code(html(strings, values));
}

/**
 * Formats text as a blockquote using HTML <blockquote> tags
 * @param text - Text to format or template literal
 * @param values - Values to interpolate if using template literal
 * @returns Blockquote-formatted text
 * @example blockquote("Famous quote")
 * @example blockquote`User message: ${message}`
 */
export function blockquote(text: string): string;
export function blockquote(
  strings: TemplateStringsArray,
  ...values: unknown[]
): string;
export function blockquote(
  strings: TemplateStringsArray | string,
  ...values: unknown[]
): string {
  if (typeof strings === "string") {
    return `<blockquote>${strings}</blockquote>`;
  }
  return blockquote(html(strings, values));
}

/**
 * Formats text as an expandable blockquote
 * Creates a collapsible text block in Telegram messages
 * @param text - Text to format or template literal
 * @param values - Values to interpolate if using template literal
 * @returns Expandable blockquote
 * @example expandableBlockquote("Long text that can be expanded")
 * @example expandableBlockquote`Detailed logs:\n${logs}`
 */
export function expandableBlockquote(text: string): string;
export function expandableBlockquote(
  strings: TemplateStringsArray,
  ...values: unknown[]
): string;
export function expandableBlockquote(
  strings: TemplateStringsArray | string,
  ...values: unknown[]
): string {
  if (typeof strings === "string") {
    return `<blockquote expandable>${strings}</blockquote>`;
  }
  return expandableBlockquote(html(strings, values));
}
