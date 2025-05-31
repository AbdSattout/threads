import { z } from "zod";

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

export { TokenSchema };
