"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { authenticate } from "@/lib/actions";
import { AuthenticationResult } from "@/lib/definitions";
import { AlertCircle, ArrowUpRight } from "lucide-react";
import { redirect, useSearchParams } from "next/navigation";
import { RefObject, Suspense, useActionState, useRef, useState } from "react";

/**
 * Skeleton component for token input field
 * Displayed while the search params are being loaded
 */
const TokenInputSkeleton = () => {
  return <Skeleton className="w-full h-9" />;
};

interface TokenInputProps {
  /** Reference to the parent form element -- used for auto-submission */
  ref: RefObject<HTMLFormElement | null>;
  /** Result of the last authentication attempt */
  result: AuthenticationResult | null;
  /** Whether an authentication request is in progress */
  isPending: boolean;
}

/**
 * Token input field component with auto-submission and validation
 */
const TokenInput = ({ ref, isPending, result }: TokenInputProps) => {
  const searchParams = useSearchParams();
  const [token, setToken] = useState("");

  // Redirect on successful authentication
  if (result?.ok) redirect(searchParams.get("to") || "/home");

  // Sync token with URL parameter if present
  if (searchParams.has("token") && token !== searchParams.get("token"))
    setToken(searchParams.get("token") ?? "");

  const { msg } = result || { msg: null };

  /**
   * Submits the form and clears the token input
   */
  const submit = () => {
    ref.current?.requestSubmit();
    requestAnimationFrame(() => setToken(""));
  };

  if (ref.current) ref.current.onsubmit = submit;

  return (
    <>
      <div className="flex items-center gap-2">
        <Input
          id="token"
          name="token"
          type="text"
          placeholder={isPending ? "Authenticating..." : "Paste your token"}
          disabled={isPending}
          value={token}
          autoFocus
          autoComplete="off"
          aria-invalid={!isPending && !!msg}
          onChange={(e) => {
            setToken(e.target.value);
            // Auto-submit when token length is correct
            if (e.target.value.length === 45) submit();
          }}
        />
        <Button type="submit" disabled={isPending}>
          Login
        </Button>
      </div>
      {!isPending && msg && (
        <p className="text-destructive text-sm">
          <AlertCircle className="h-4 w-4 inline text-destructive" /> {msg}
        </p>
      )}
    </>
  );
};

/**
 * Complete login form component with token input and Telegram bot link
 *
 * Features:
 * - Auto-submission when valid token is pasted
 * - Error message display
 * - Loading state handling
 * - Direct link to Telegram bot for token generation
 *
 * @example
 * // In a login page:
 * export default function LoginPage() {
 *   return (
 *     <div>
 *       <h1>Login</h1>
 *       <LoginForm />
 *     </div>
 *   );
 * }
 */
const LoginForm = () => {
  const formRef = useRef<HTMLFormElement>(null);
  const [result, formAction, isPending] = useActionState(authenticate, null);

  return (
    <form className="grid gap-2" action={formAction} ref={formRef}>
      <div className="flex items-center">
        <Label htmlFor="token">Token</Label>
        <a
          href="https://t.me/ThreadsAlertsBot?start=auth"
          target="_blank"
          rel="noreferrer"
          className="ml-auto text-sm inline-block"
        >
          Request a token <ArrowUpRight className="h-4 w-4 inline" />
        </a>
      </div>
      <Suspense fallback={<TokenInputSkeleton />}>
        <TokenInput ref={formRef} result={result} isPending={isPending} />
      </Suspense>
    </form>
  );
};

export { LoginForm };
