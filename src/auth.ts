import {
  addSession,
  getSessionWithUser,
  getTokenWithUser,
  removeSession,
  revokeToken,
  updateSession,
} from "@/lib/db";
import { AuthenticationResult } from "@/lib/definitions";
import { bold } from "@/lib/tg-format";
import { getDeviceInfo, getLoginInfo, sendMessage } from "@/lib/utils";
import { cookies as getCookies, headers as getHeaders } from "next/headers";
import { redirect } from "next/navigation";
import { after } from "next/server";

// Cookie names for storing session information
const SESSION_ID_COOKIE = "session_id";
const SESSION_TOKEN_COOKIE = "session_token";

/**
 * Retrieves and validates the current user session
 *
 * Updates the session's last active timestamp and device info
 *
 * @returns Session object if authenticated, null otherwise
 */
const getSession = async () => {
  const cookies = await getCookies();
  const id = cookies.get(SESSION_ID_COOKIE)?.value;
  const token = cookies.get(SESSION_TOKEN_COOKIE)?.value;

  if (!id || !token) return null;

  const session = await getSessionWithUser(id);

  if (!session || session.token !== token) return null;

  const headers = await getHeaders();
  const deviceInfo = getDeviceInfo(headers);

  after(async () => {
    await updateSession(id, deviceInfo);
  });

  return session;
};

/**
 * Authentication guard - redirects to login if not authenticated
 *
 * @returns Session object if authenticated
 * @throws Redirects to login page if not authenticated
 */
const requireAuth = async () => {
  const session = await getSession();

  if (!session) redirect("/login");

  return session;
};

/**
 * Creates a new session for a user and sets session cookies
 *
 * Can only be used in a Server Action or Route Handler
 *
 * @param token - One-time login token
 */
const signIn = async (token: string): Promise<AuthenticationResult> => {
  const { user } = (await getTokenWithUser(token)) || { user: null };
  if (!user) return { ok: false, msg: "Invalid or expired token." };

  const headers = await getHeaders();
  const deviceInfo = getDeviceInfo(headers);
  const info = getLoginInfo(headers, token);

  const session = await addSession(user.id, deviceInfo);

  const cookies = await getCookies();
  cookies.set(SESSION_ID_COOKIE, session.id);
  cookies.set(SESSION_TOKEN_COOKIE, session.token);

  // Send Telegram notification about successful login
  after(async () => {
    await sendMessage(
      parseInt(user.id, 16),
      `✅ You've successfully logged in to ${bold("Threads")}!\n\n${info}`,
    );

    await revokeToken(token);
  });

  return { ok: true };
};

/**
 * Destroys the current session and clears session cookies
 *
 * Can only be used in a Server Action or Route Handler
 */
const signOut = async () => {
  const cookies = await getCookies();
  const id = cookies.get(SESSION_ID_COOKIE)?.value;
  const token = cookies.get(SESSION_TOKEN_COOKIE)?.value;

  if (id && token) await removeSession(id);

  cookies.delete(SESSION_ID_COOKIE);
  cookies.delete(SESSION_TOKEN_COOKIE);
};

/**
 * Checks if the current request is authenticated
 */
const isAuthenticated = async () => {
  const session = await getSession();
  return session !== null;
};

export { getSession, isAuthenticated, requireAuth, signIn, signOut };
