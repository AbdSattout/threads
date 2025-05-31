"use server";

import { signIn, signOut } from "@/auth";
import { AuthenticationResult, TokenSchema } from "@/lib/definitions";
import { AuthError, CredentialsSignin } from "next-auth";
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
  try {
    const token = formData.get("token") || "";

    // Validate token format using Zod
    const parsed = TokenSchema.safeParse(token);

    if (!parsed.success)
      return {
        ok: false,
        msg: parsed.error.issues.at(0)?.message || "Invalid token.",
      };

    await signIn("telegram", { token: formData.get("token"), redirect: false });
    revalidatePath("/");
    return { ok: true };
  } catch (error) {
    if (error instanceof AuthError) {
      if (error instanceof CredentialsSignin)
        return { ok: false, msg: "Invalid or expired token." };
      return { ok: false, msg: "Something went wrong." };
    }

    throw error;
  }
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
  await signOut({ redirect: false });
  revalidatePath("/");
  redirect("/login");
};

export { authenticate, logout };
