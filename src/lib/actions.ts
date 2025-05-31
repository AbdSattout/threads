"use server";

import { signIn, signOut } from "@/auth";
import { AuthenticationResult, TokenSchema } from "@/lib/definitions";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

/**
 * This server action handles the authentication process and manages
 * related side effects like cache revalidation
 *
 * @param _prevState - Previous authentication state (unused)
 * @param formData - Form data containing the authentication token
 * @returns Promise resolving to authentication result
 *
 * @example
 * // In a form component:
 * const [state, formAction, isPending] = useActionState(authenticate, null);
 * <form action={formAction}>
 *   <input name="token" />
 * </form>
 */
const authenticate = async (
  _prevState: AuthenticationResult | null,
  formData: FormData,
): Promise<AuthenticationResult> => {
  const token = formData.get("token") || "";

  // Validate token format using Zod
  const parsed = TokenSchema.safeParse(token);

  if (!parsed.success)
    return {
      ok: false,
      msg: parsed.error.issues.at(0)?.message || "Invalid token.",
    };

  const result = await signIn(parsed.data);
  if (result.ok) revalidatePath("/");
  return result;
};

/**
 * This server action handles the sign-out process, revalidates
 * cached data, and redirects to the login page
 *
 * @example
 * // In a component:
 * <form action={logout}>
 *   <button>Sign Out</button>
 * </form>
 */
const logout = async () => {
  await signOut();
  revalidatePath("/");
  redirect("/login");
};

export { authenticate, logout };
