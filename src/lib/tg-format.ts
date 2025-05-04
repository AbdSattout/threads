import { html } from "@/lib/utils";

export function normal(strings: TemplateStringsArray, ...values: unknown[]): string {
  return html(strings, values);
}

export function bold(text: string): string;
export function bold(strings: TemplateStringsArray, ...values: unknown[]): string;
export function bold(strings: TemplateStringsArray | string, ...values: unknown[]): string {
  if (typeof strings === 'string') {
    return `<b>${strings}</b>`;
  }
  return bold(html(strings, values));
}

export function italic(text: string): string;
export function italic(strings: TemplateStringsArray, ...values: unknown[]): string;
export function italic(strings: TemplateStringsArray | string, ...values: unknown[]): string {
  if (typeof strings === 'string') {
    return `<i>${strings}</i>`;
  }
  return italic(html(strings, values));
}

export function underline(text: string): string;
export function underline(strings: TemplateStringsArray, ...values: unknown[]): string;
export function underline(strings: TemplateStringsArray | string, ...values: unknown[]): string {
  if (typeof strings === 'string') {
    return `<u>${strings}</u>`;
  }
  return underline(html(strings, values));
}

export function strikethrough(text: string): string;
export function strikethrough(strings: TemplateStringsArray, ...values: unknown[]): string;
export function strikethrough(strings: TemplateStringsArray | string, ...values: unknown[]): string {
  if (typeof strings === 'string') {
    return `<s>${strings}</s>`;
  }
  return strikethrough(html(strings, values));
}

export function spoiler(text: string): string;
export function spoiler(strings: TemplateStringsArray, ...values: unknown[]): string;
export function spoiler(strings: TemplateStringsArray | string, ...values: unknown[]): string {
  if (typeof strings === 'string') {
    return `<span class="tg-spoiler">${strings}</span>`;
  }
  return spoiler(html(strings, values));
}

export function link(href: string, text: string): string;
export function link(href: string, strings: TemplateStringsArray, ...values: unknown[]): string;
export function link(
  href: string,
  strings: TemplateStringsArray | string,
  ...values: unknown[]
): string {
  if (typeof strings === 'string') {
    return `<a href="${href}">${strings}</a>`;
  }
  return link(href, html(strings, values));
}

export function mention(userId: number | string, text: string): string;
export function mention(userId: number | string, strings: TemplateStringsArray, ...values: unknown[]): string;
export function mention(
  userId: number | string,
  strings: TemplateStringsArray | string,
  ...values: unknown[]
): string {
  const href = `tg://user?id=${userId}`;
  if (typeof strings === 'string') {
    return `<a href="${href}">${strings}</a>`;
  }
  return mention(userId, html(strings, values));
}

export function emoji(emojiId: string, emoji: string): string;
export function emoji(emojiId: string, strings: TemplateStringsArray, ...values: unknown[]): string;
export function emoji(
  emojiId: string,
  strings: TemplateStringsArray | string,
  ...values: unknown[]
): string {
  if (typeof strings === 'string') {
    return `<tg-emoji emoji-id="${emojiId}">${strings}</tg-emoji>`;
  }
  return emoji(emojiId, html(strings, values));
}

export function code(text: string): string;
export function code(strings: TemplateStringsArray, ...values: unknown[]): string;
export function code(strings: TemplateStringsArray | string, ...values: unknown[]): string {
  if (typeof strings === 'string') {
    return `<code>${strings}</code>`;
  }
  return code(html(strings, values));
}

export function pre(text: string): string;
export function pre(strings: TemplateStringsArray, ...values: unknown[]): string;
export function pre(strings: TemplateStringsArray | string, ...values: unknown[]): string {
  if (typeof strings === 'string') {
    return `<pre>${strings}</pre>`;
  }
  return pre(html(strings, values));
}

export function preCode(lang: string, text: string): string;
export function preCode(lang: string, strings: TemplateStringsArray, ...values: unknown[]): string;
export function preCode(
  lang: string,
  strings: TemplateStringsArray | string,
  ...values: unknown[]
): string {
  if (typeof strings === 'string') {
    return `<pre><code class="language-${lang}">${strings}</code></pre>`;
  }
  return preCode(lang, html(strings, values));
}

export function blockquote(text: string): string;
export function blockquote(strings: TemplateStringsArray, ...values: unknown[]): string;
export function blockquote(
  strings: TemplateStringsArray | string,
  ...values: unknown[]
): string {
  if (typeof strings === 'string') {
    return `<blockquote>${strings}</blockquote>`;
  }
  return blockquote(html(strings, values));
}

export function expandableBlockquote(text: string): string;
export function expandableBlockquote(strings: TemplateStringsArray, ...values: unknown[]): string;
export function expandableBlockquote(
  strings: TemplateStringsArray | string,
  ...values: unknown[]
): string {
  if (typeof strings === 'string') {
    return `<blockquote expandable>${strings}</blockquote>`;
  }
  return expandableBlockquote(html(strings, values));
}
