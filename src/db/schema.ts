import { relations } from "drizzle-orm";
import {
  AnyPgColumn,
  pgTable,
  primaryKey,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

const users = pgTable("users", {
  id: varchar({ length: 16 }).primaryKey().notNull(),
  name: varchar({ length: 255 }).notNull(),
  createdAt: timestamp().defaultNow(),
});

const tokens = pgTable("tokens", {
  id: varchar({ length: 16 })
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  token: varchar({ length: 45 }).unique().notNull(),
  expiresAt: timestamp().notNull(),
});

const posts = pgTable("posts", {
  id: uuid().primaryKey().defaultRandom(),
  user: varchar({ length: 16 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  text: varchar({ length: 255 }).notNull(),
  date: timestamp().defaultNow(),
  replyTo: uuid().references((): AnyPgColumn => posts.id, {
    onDelete: "cascade",
  }),
});

const likes = pgTable(
  "likes",
  {
    user: varchar({ length: 16 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    post: uuid()
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
  },
  (t) => [
    primaryKey({
      columns: [t.user, t.post],
    }),
  ],
);

const usersRelations = relations(users, ({ one, many }) => ({
  token: one(tokens, {
    fields: [users.id],
    references: [tokens.id],
  }),
  posts: many(posts),
  likes: many(likes),
}));

const tokensRelations = relations(tokens, ({ one }) => ({
  user: one(users, {
    fields: [tokens.id],
    references: [users.id],
  }),
}));

const postsRelations = relations(posts, ({ one, many }) => ({
  user: one(users, {
    fields: [posts.user],
    references: [users.id],
  }),
  replyTo: one(posts, {
    fields: [posts.replyTo],
    references: [posts.id],
    relationName: "replies",
  }),
  replies: many(posts, {
    relationName: "replies",
  }),
  likes: many(likes),
}));

const likesRelations = relations(likes, ({ one }) => ({
  user: one(users, {
    fields: [likes.user],
    references: [users.id],
  }),
  post: one(posts, {
    fields: [likes.post],
    references: [posts.id],
  }),
}));

export {
  likes,
  likesRelations,
  posts,
  postsRelations,
  tokens,
  tokensRelations,
  users,
  usersRelations,
};
