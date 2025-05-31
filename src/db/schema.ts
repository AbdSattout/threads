import { relations } from "drizzle-orm";
import {
  AnyPgColumn,
  pgTable,
  primaryKey,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

/**
 * Users table -- Stores core user information
 */
const users = pgTable("users", {
  /** Unique user identifier, 16 characters */
  id: varchar({ length: 16 }).primaryKey().notNull(),
  /** User's display name */
  name: varchar({ length: 255 }).notNull(),
  /** Timestamp when the user account was created */
  createdAt: timestamp().defaultNow(),
});

/**
 * Authentication tokens table -- Stores tokens with expiration timestamps
 */
const tokens = pgTable("tokens", {
  /** User ID associated with this token */
  id: varchar({ length: 16 })
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  /** Authentication token */
  token: varchar({ length: 45 }).unique().notNull(),
  /** Token expiration timestamp */
  expiresAt: timestamp().notNull(),
});

/**
 * Posts table -- Stores user posts/threads with support for replies
 */
const posts = pgTable("posts", {
  /** Unique post identifier */
  id: uuid().primaryKey().defaultRandom(),
  /** ID of the user who created the post */
  user: varchar({ length: 16 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  /** Post content text */
  text: varchar({ length: 255 }).notNull(),
  /** Timestamp when the post was created */
  date: timestamp().defaultNow(),
  /** Optional reference to parent post ID for replies */
  replyTo: uuid().references((): AnyPgColumn => posts.id, {
    onDelete: "cascade",
  }),
});

/**
 * Likes table -- Tracks user likes on posts
 */
const likes = pgTable(
  "likes",
  {
    /** ID of the user who created the like */
    user: varchar({ length: 16 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    /** ID of the post that was liked */
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

/**
 * Defines relationships for the users table
 * - One-to-one relationship with tokens
 * - One-to-many relationship with posts
 * - One-to-many relationship with likes
 */
const usersRelations = relations(users, ({ one, many }) => ({
  token: one(tokens, {
    fields: [users.id],
    references: [tokens.id],
  }),
  posts: many(posts),
  likes: many(likes),
}));

/**
 * Defines relationships for the tokens table
 * - One-to-one relationship with users
 */
const tokensRelations = relations(tokens, ({ one }) => ({
  user: one(users, {
    fields: [tokens.id],
    references: [users.id],
  }),
}));

/**
 * Defines relationships for the posts table
 * - One-to-one relationship with users (author)
 * - Self-referential relationship for replies
 * - One-to-many relationship with likes
 */
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

/**
 * Defines relationships for the likes table
 * - One-to-one relationship with users
 * - One-to-one relationship with posts
 */
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
