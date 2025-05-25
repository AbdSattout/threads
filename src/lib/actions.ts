"use server";

import { signIn, signOut } from "@/auth";
import { AuthError, CredentialsSignin } from "next-auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type AuthenticationResult = { ok: true } | { ok: false, msg: string };

const authenticate = async (_prevState: AuthenticationResult | null, formData: FormData): Promise<AuthenticationResult> => {
  try {
    await signIn("telegram", { token: formData.get("token"), redirect: false });
    revalidatePath("/");
    return { ok: true };
  } catch (error) {
    if (error instanceof AuthError) {
      if (error instanceof CredentialsSignin) return { ok: false, msg: "Invalid or expired token." };
      return { ok: false, msg: "Something went wrong." };
    }

    throw error;
  }
}

const logout = async () => {
  await signOut({ redirect: false });
  revalidatePath("/");
  redirect("/login");
};

export { authenticate, logout };
