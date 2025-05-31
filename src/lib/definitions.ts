import { z } from "zod";

/**
 * Generic result type for operations that can succeed or fail
 *
 * @template T - Optional data type to return on success
 */
type Result<T = void> =
  | {
      /** Whether the operation was successful */
      ok: true;
      /** Optional data returned on success */
      data?: T;
    }
  | {
      /** Whether the operation was successful */
      ok: false;
      /** Error message in case of failure */
      msg: string;
    };

/**
 * Authentication result type used in server actions
 */
type AuthenticationResult = Result<undefined>;

/**
 * Interface for Telegram chat data received from webhook
 */
interface TelegramChat {
  /** Unique chat identifier */
  id: number;
  /** Type of chat (private, group, etc.) */
  type: string;
  /** User's first name */
  first_name: string;
  /** User's last name (optional) */
  last_name?: string;
}

/**
 * Interface for Telegram message received from webhook
 */
interface TelegramMessage {
  /** Message text content */
  text: string;
  /** Chat where message was sent */
  chat: TelegramChat;
}

/**
 * Interface for Telegram update received from webhook
 */
interface TelegramUpdate {
  /** Message content (optional) */
  message?: TelegramMessage;
}

/**
 * Interface for Telegram inline keyboard button
 */
interface InlineKeyboardButton {
  /** Button text to display */
  text: string;
  /** URL to open when button is clicked */
  url: string;
}

/**
 * Interface for Telegram message sending options
 */
interface MessageOptions {
  /** Markdown parsing mode for the message */
  parse_mode?: "Markdown" | "MarkdownV2" | "HTML";
  /** Inline keyboard markup for interactive buttons */
  reply_markup?: {
    inline_keyboard: InlineKeyboardButton[][];
  };
}

/**
 * Zod schema for validating authentication tokens
 */
const TokenSchema = z
  .string({
    message: "Token must be a string.",
  })
  .nonempty({
    message: "Token is required.",
  })
  .regex(/^[0-9a-f]+$/, {
    message: "Token must only contain lowercase letters (a-f) and numbers.",
  })
  .length(45, {
    message: "Token must be exactly 45 characters long.",
  });

export {
  TokenSchema,
  type AuthenticationResult,
  type InlineKeyboardButton,
  type MessageOptions,
  type Result,
  type TelegramChat,
  type TelegramMessage,
  type TelegramUpdate,
};
