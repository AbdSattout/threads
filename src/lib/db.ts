import db from "@/db";
import { likes, posts, tokens, users } from "@/db/schema";
import { generateRandomToken } from "@/lib/utils";
import { and, count, desc, eq } from "drizzle-orm";

const addUser = async (id: string, name: string) => {
  const [user] = await db
    .insert(users)
    .values({ id, name })
    .onConflictDoNothing()
    .returning();

  return user;
};

const getUser = async (id: string) => {
  const user = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.id, id),
  });

  return user ?? null;
};

const updateUser = async (id: string, name: string) => {
  const [user] = await db
    .insert(users)
    .values({ id, name })
    .onConflictDoUpdate({
      target: users.id,
      set: { name },
    })
    .returning();

  return user;
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
  const revokedTokens = await db
    .delete(tokens)
    .where(eq(tokens.token, token))
    .returning();

  if (!revokedTokens) return null;

  return revokedTokens[0];
};

const getTokenWithUser = async (token: string) => {
  const tokenWithUser = await db.query.tokens.findFirst({
    where: (tokens, { eq, and, gt }) =>
      and(eq(tokens.token, token), gt(tokens.expiresAt, new Date())),
    with: {
      user: true,
    },
  });

  return tokenWithUser ?? null;
};

const addPost = async (user: string, text: string, replyTo?: string) => {
  const [post] = await db
    .insert(posts)
    .values({ user, text, replyTo })
    .returning();

  return post;
};

const getPostsCount = async (user: string) => {
  const [{ cnt }] = await db
    .select({ cnt: count() })
    .from(posts)
    .where(eq(posts.user, user));

  return cnt;
};

const getLikesCount = async (post: string) => {
  const [{ cnt }] = await db
    .select({ cnt: count() })
    .from(likes)
    .where(eq(likes.post, post));

  return cnt;
};

const getRepliesCount = async (post: string) => {
  const [{ cnt }] = await db
    .select({ cnt: count() })
    .from(posts)
    .where(eq(posts.replyTo, post));

  return cnt;
};

const getPosts = async (user: string) => {
  const postsList = await db.query.posts.findMany({
    where: (posts, { eq }) => eq(posts.user, user),
    orderBy: [desc(posts.date)],
  });

  return await Promise.all(
    postsList.map(async (post) => ({
      ...post,
      likesCount: await getLikesCount(post.id),
      repliesCount: await getRepliesCount(post.id),
    })),
  );
};

const getPost = async (id: string) => {
  const post = await db.query.posts.findFirst({
    where: (posts, { eq }) => eq(posts.id, id),
    with: {
      user: true,
    },
  });

  if (!post) return null;

  return {
    ...post,
    likesCount: await getLikesCount(post.id),
    repliesCount: await getRepliesCount(post.id),
  };
};

const getPostWithReplies = async (id: string) => {
  const post = await db.query.posts.findFirst({
    where: (posts, { eq }) => eq(posts.id, id),
    with: {
      user: true,
      replies: {
        with: {
          user: true,
        },
      },
    },
  });

  if (!post) return null;

  const repliesWithCounts = await Promise.all(
    post.replies.map(async (reply) => ({
      ...reply,
      likesCount: await getLikesCount(reply.id),
      repliesCount: await getRepliesCount(reply.id),
    })),
  );

  return {
    ...post,
    likesCount: await getLikesCount(post.id),
    repliesCount: await getRepliesCount(post.id),
    replies: repliesWithCounts,
  };
};

const removePost = async (post: string) => {
  const removedPosts = await db
    .delete(posts)
    .where(eq(posts.id, post))
    .returning();

  if (!removedPosts) return null;

  return removedPosts[0];
};

const addLike = async (user: string, post: string) => {
  const [like] = await db
    .insert(likes)
    .values({ user, post })
    .onConflictDoNothing()
    .returning();

  return like;
};

const removeLike = async (user: string, post: string) => {
  const removedLikes = await db
    .delete(likes)
    .where(and(eq(likes.user, user), eq(likes.post, post)))
    .returning();

  if (!removedLikes) return null;

  return removedLikes[0];
};

const getLikeStatus = async (user: string, post: string) => {
  const like = await db.query.likes.findFirst({
    where: (likes, { and, eq }) =>
      and(eq(likes.user, user), eq(likes.post, post)),
  });

  return !!like;
};

export {
  addLike,
  addPost,
  addUser,
  generateToken,
  getLikesCount,
  getLikeStatus,
  getPost,
  getPosts,
  getPostsCount,
  getPostWithReplies,
  getRepliesCount,
  getTokenWithUser,
  getUser,
  removeLike,
  removePost,
  revokeToken,
  updateUser,
};
