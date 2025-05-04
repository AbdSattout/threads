import { pgTable, varchar, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: varchar({ length: 16 }).primaryKey().notNull(),
  name: varchar({ length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const tokens = pgTable("tokens", {
  id: varchar({ length: 16 }).primaryKey().references(() => users.id),
  token: varchar({ length: 45 }).unique().notNull(),
  expiresAt: timestamp().notNull(),
});

export const usersRelations = relations(users, ({ one }) => ({
  token: one(tokens, {
    fields: [users.id],
    references: [tokens.id],
  }),
}));

export const tokensRelations = relations(tokens, ({ one }) => ({
  user: one(users, {
    fields: [tokens.id],
    references: [users.id],
  }),
}));
