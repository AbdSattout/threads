import db from "@/db";
import { likes, posts, sessions, tokens, users } from "@/db/schema";
import { generateRandomToken } from "@/lib/utils";
import { and, count, desc, eq } from "drizzle-orm";

/**
 * Creates a new user if they don't exist
 * @param id - Unique user identifier (from Telegram)
 * @param name - User's display name
 * @returns Created user object or null if error occurs
 */
const addUser = async (id: string, name: string) => {
  try {
    const [user] = await db
      .insert(users)
      .values({ id, name })
      .onConflictDoNothing()
      .returning();

    return user;
  } catch (error) {
    console.error("Error adding user:", error);
    return null;
  }
};

/**
 * Retrieves a user by their ID
 * @param id - User's unique identifier
 * @returns User object or null if not found
 */
const getUser = async (id: string) => {
  try {
    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, id),
    });

    return user ?? null;
  } catch (error) {
    console.error("Error getting user:", error);
    return null;
  }
};

/**
 * Updates or creates a user with the given information
 * @param id - User's unique identifier
 * @param name - User's new display name
 * @returns Updated or created user object or null if error occurs
 */
const updateUser = async (id: string, name: string) => {
  try {
    const [user] = await db
      .insert(users)
      .values({ id, name })
      .onConflictDoUpdate({
        target: users.id,
        set: { name },
      })
      .returning();

    return user;
  } catch (error) {
    console.error("Error updating user:", error);
    return null;
  }
};

/**
 * Generates a new authentication token for a user
 *
 * Token format: 32 random chars + 13 char padded user ID
 *
 * Expires in 10 minutes from creation
 *
 * @param id - User's unique identifier
 * @returns Generated token string or null if error occurs
 */
const generateToken = async (id: string) => {
  try {
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
  } catch (error) {
    console.error("Error generating token:", error);
    return null;
  }
};

/**
 * Revokes (deletes) an authentication token
 * @param token - Token string to revoke
 * @returns Revoked token object or null if token not found
 */
const revokeToken = async (token: string) => {
  try {
    const revokedTokens = await db
      .delete(tokens)
      .where(eq(tokens.token, token))
      .returning();

    if (!revokedTokens) return null;

    return revokedTokens[0];
  } catch (error) {
    console.error("Error revoking token:", error);
    return null;
  }
};

/**
 * Retrieves a valid token and its associated user
 *
 * @param token - Token string to validate
 * @returns Token with user object or null if invalid/expired
 */
const getTokenWithUser = async (token: string) => {
  try {
    const tokenWithUser = await db.query.tokens.findFirst({
      where: (tokens, { eq, and, gt }) =>
        and(eq(tokens.token, token), gt(tokens.expiresAt, new Date())),
      with: {
        user: true,
      },
    });

    return tokenWithUser ?? null;
  } catch (error) {
    console.error("Error getting token with user:", error);
    return null;
  }
};

/**
 * Creates a new post or reply
 * @param user - ID of the user creating the post
 * @param text - Content of the post
 * @param replyTo - Optional ID of the post being replied to
 * @returns Created post object or null if error occurs
 */
const addPost = async (user: string, text: string, replyTo?: string) => {
  try {
    const [post] = await db
      .insert(posts)
      .values({ user, text, replyTo })
      .returning();

    return post;
  } catch (error) {
    console.error("Error adding post:", error);
    return null;
  }
};

/**
 * Counts total posts by a user
 * @param user - User's unique identifier
 * @returns Number of posts by the user or 0 if error occurs
 */
const getPostsCount = async (user: string) => {
  try {
    const [{ cnt }] = await db
      .select({ cnt: count() })
      .from(posts)
      .where(eq(posts.user, user));

    return cnt;
  } catch (error) {
    console.error("Error getting posts count:", error);
    return 0;
  }
};

/**
 * Counts likes on a specific post
 * @param post - Post's unique identifier
 * @returns Number of likes on the post or 0 if error occurs
 */
const getLikesCount = async (post: string) => {
  try {
    const [{ cnt }] = await db
      .select({ cnt: count() })
      .from(likes)
      .where(eq(likes.post, post));

    return cnt;
  } catch (error) {
    console.error("Error getting likes count:", error);
    return 0;
  }
};

/**
 * Counts replies to a specific post
 * @param post - Post's unique identifier
 * @returns Number of replies to the post or 0 if error occurs
 */
const getRepliesCount = async (post: string) => {
  try {
    const [{ cnt }] = await db
      .select({ cnt: count() })
      .from(posts)
      .where(eq(posts.replyTo, post));

    return cnt;
  } catch (error) {
    console.error("Error getting replies count:", error);
    return 0;
  }
};

/**
 * Retrieves all posts by a user with like and reply counts, ordered by date (newest first)
 * @param user - User's unique identifier
 * @returns Array of posts with engagement metrics or an empty array if error occurs
 */
const getPosts = async (user: string) => {
  try {
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
  } catch (error) {
    console.error("Error getting posts:", error);
    return [];
  }
};

/**
 * Retrieves a single post with its author and engagement metrics
 * @param id - Post's unique identifier
 * @returns Post object with user and counts or null if not found
 */
const getPost = async (id: string) => {
  try {
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
  } catch (error) {
    console.error("Error getting post:", error);
    return null;
  }
};

/**
 * Retrieves a post with its replies, authors, and engagement metrics
 *
 * Includes full user information for the post and all replies
 *
 * @param id - Post's unique identifier
 * @returns Post object with replies and metadata or null if not found
 */
const getPostWithReplies = async (id: string) => {
  try {
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
  } catch (error) {
    console.error("Error getting post with replies:", error);
    return null;
  }
};

/**
 * Deletes a post and its associated data
 * @param post - Post's unique identifier
 * @returns Deleted post object or null if not found
 */
const removePost = async (post: string) => {
  try {
    const removedPosts = await db
      .delete(posts)
      .where(eq(posts.id, post))
      .returning();

    if (!removedPosts) return null;

    return removedPosts[0];
  } catch (error) {
    console.error("Error removing post:", error);
    return null;
  }
};

/**
 * Creates a new like on a post
 * @param user - ID of the user liking the post
 * @param post - ID of the post being liked
 * @returns Created like object or null if error occurs
 */
const addLike = async (user: string, post: string) => {
  try {
    const [like] = await db
      .insert(likes)
      .values({ user, post })
      .onConflictDoNothing()
      .returning();

    return like;
  } catch (error) {
    console.error("Error adding like:", error);
    return null;
  }
};

/**
 * Removes a like from a post
 * @param user - ID of the user unliking the post
 * @param post - ID of the post being unliked
 * @returns Removed like object or null if not found
 */
const removeLike = async (user: string, post: string) => {
  try {
    const removedLikes = await db
      .delete(likes)
      .where(and(eq(likes.user, user), eq(likes.post, post)))
      .returning();

    if (!removedLikes) return null;

    return removedLikes[0];
  } catch (error) {
    console.error("Error removing like:", error);
    return null;
  }
};

/**
 * Checks if a user has liked a specific post
 * @param user - User's unique identifier
 * @param post - Post's unique identifier
 * @returns Boolean indicating if the post is liked by the user or false if error occurs
 */
const getLikeStatus = async (user: string, post: string) => {
  try {
    const like = await db.query.likes.findFirst({
      where: (likes, { and, eq }) =>
        and(eq(likes.user, user), eq(likes.post, post)),
    });

    return !!like;
  } catch (error) {
    console.error("Error getting like status:", error);
    return false;
  }
};

/**
 * Creates a new session for a user
 * @param user - ID of the user creating the session
 * @param device - User agent or device information
 * @returns Created session object with token or null if error occurs
 */
const addSession = async (user: string, device: string) => {
  try {
    const token = generateRandomToken(32);

    const [session] = await db
      .insert(sessions)
      .values({
        user: user,
        token,
        device,
        lastActive: new Date(),
      })
      .returning();

    return session;
  } catch (error) {
    console.error("Error adding session:", error);
    return null;
  }
};

/**
 * Updates a session's last active timestamp and device info
 * @param id - Unique session identifier
 * @param device - Updated user agent or device information
 * @returns Updated session object or null if not found
 */
const updateSession = async (id: string, device: string) => {
  try {
    const updatedSessions = await db
      .update(sessions)
      .set({
        lastActive: new Date(),
        device,
      })
      .where(eq(sessions.id, id))
      .returning();

    if (!updatedSessions) return null;

    return updatedSessions[0];
  } catch (error) {
    console.error("Error updating session:", error);
    return null;
  }
};

/**
 * Retrieves a session by its id
 * @param id - Unique session identifier
 * @returns Session object or null if not found
 */
const getSessionWithUser = async (id: string) => {
  try {
    const session = await db.query.sessions.findFirst({
      where: (sessions, { eq }) => eq(sessions.id, id),
      with: {
        user: true,
      },
    });

    return session || null;
  } catch (error) {
    console.error("Error getting session with user:", error);
    return null;
  }
};

/**
 * Deletes a session by its ID
 * @param id - Unique session identifier
 * @returns Deleted session object or null if not found
 */
const removeSession = async (id: string) => {
  try {
    const [session] = await db
      .delete(sessions)
      .where(eq(sessions.id, id))
      .returning();

    return session || null;
  } catch (error) {
    console.error("Error removing session:", error);
    return null;
  }
};

/**
 * Gets all sessions for a user
 * @param user - User's unique identifier
 * @returns Array of session objects or an empty array if not found
 */
const getUserSessions = async (user: string) => {
  try {
    const userSessions = await db.query.sessions.findMany({
      where: (sessions, { eq }) => eq(sessions.user, user),
      orderBy: [desc(sessions.lastActive)],
    });

    return userSessions;
  } catch (error) {
    console.error("Error getting user sessions:", error);
    return [];
  }
};

/**
 * Remove all sessions for a user
 * @param user - User's unique identifier
 * @returns True if successful, false otherwise
 */
const removeUserSessions = async (user: string) => {
  try {
    await db.delete(sessions).where(eq(sessions.user, user));
    return true;
  } catch (error) {
    console.error("Error removing user sessions:", error);
    return false;
  }
};

export {
  addLike,
  addPost,
  addSession,
  addUser,
  generateToken,
  getLikesCount,
  getLikeStatus,
  getPost,
  getPosts,
  getPostsCount,
  getPostWithReplies,
  getRepliesCount,
  getSessionWithUser,
  getTokenWithUser,
  getUser,
  getUserSessions,
  removeLike,
  removePost,
  removeSession,
  removeUserSessions,
  revokeToken,
  updateSession,
  updateUser,
};
