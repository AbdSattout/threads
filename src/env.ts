import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    BOT_TOKEN: z.string().min(1),
    BOT_SECRET: z.string().min(1).max(255).regex(/^[A-Za-z0-9_-]+$/),
    DATABASE_URL: z.string().url(),
    WEBSITE_URL: z.string().url(),
  },
  experimental__runtimeEnv: process.env,
});