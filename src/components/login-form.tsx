"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { authenticate, type AuthenticationResult } from "@/lib/actions";
import { AlertCircle, ArrowUpRight } from "lucide-react";
import { redirect, useSearchParams } from "next/navigation";
import { RefObject, Suspense, useActionState, useRef, useState } from "react";

const TokenInputSkeleton = () => {
  return <Skeleton className="w-full h-9" />;
};

const TokenInput = ({
  ref,
  isPending,
  result,
}: {
  ref: RefObject<HTMLFormElement | null>;
  isPending: boolean;
  result: AuthenticationResult | null;
}) => {
  const searchParams = useSearchParams();
  const [token, setToken] = useState("");
  if (result?.ok) redirect(searchParams.get("to") || "/home");
  if (searchParams.has("token") && token !== searchParams.get("token"))
    setToken(searchParams.get("token") ?? "");

  const { msg } = result || { msg: null };
  const submit = () => {
    ref.current?.requestSubmit();
    setToken("");
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
          required
          autoFocus
          autoComplete="off"
          pattern="[0-9a-f]{45}"
          onChange={(e) => {
            setToken(e.target.value);
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
