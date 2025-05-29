import db from "@/db";
import { tokens, users } from "@/db/schema";
import { generateRandomToken } from "@/lib/utils";
import { eq } from "drizzle-orm";

const addUser = async (id: string, name: string) => {
  await db.insert(users).values({ id, name }).onConflictDoNothing();
};

const getUser = async (id: string) => {
  return await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.id, id),
  });
};

const updateUser = async (id: string, name: string) => {
  await db.insert(users).values({ id, name }).onConflictDoUpdate({
    target: users.id,
    set: { name },
  });
};

const generateToken = async (id: string) => {
  const token = generateRandomToken() + id.padStart(13, "0");
  const data = {
    token,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
  };

  await db
    .insert(tokens)
    .values({ id, ...data })
    .onConflictDoUpdate({
      target: tokens.id,
      set: data,
    });

  return token;
};

const revokeToken = async (token: string) => {
  await db.delete(tokens).where(eq(tokens.token, token));
};

const getTokenWithUser = async (token: string) => {
  return await db.query.tokens.findFirst({
    where: (tokens, { eq, and, gt }) =>
      and(eq(tokens.token, token), gt(tokens.expiresAt, new Date())),
    with: {
      user: true,
    },
  });
};

export {
  addUser,
  generateToken,
  getTokenWithUser,
  getUser,
  revokeToken,
  updateUser,
};
