"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authenticate, type AuthenticationResult } from "@/lib/actions";
import { ArrowUpRight, CircleAlert } from "lucide-react";
import { redirect, useSearchParams } from "next/navigation";
import { useActionState, useRef, Suspense, RefObject } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const TokenInputSkeleton = () => {
  return <Skeleton className="w-full h-9" />;
};

const TokenInput = ({ ref, isPending, result }: {
  ref: RefObject<HTMLFormElement | null>;
  isPending: boolean;
  result: AuthenticationResult | null;
}) => {
  const searchParams = useSearchParams();
  if (result?.ok) redirect(searchParams.get("to") || "/");

  const { msg } = result || { msg: null };

  return <>
    <div className="flex items-center gap-2">
      <Input
        id="token"
        name="token"
        type="text"
        placeholder="Paste your token"
        disabled={isPending}
        defaultValue={searchParams.get("token") || ""}
        required
        autoComplete="off"
        pattern="[0-9a-f]{45}"
        onChange={e => {
          if (e.target.value.length === 45) ref.current?.requestSubmit();
        }}
      />
      <Button type="submit" disabled={isPending}>Login</Button>
    </div>
    {msg && <p className="text-destructive text-sm"><CircleAlert className="h-4 w-4 inline text-destructive" /> {msg}</p>}
  </>;
};

const LoginForm = () => {
  const formRef = useRef<HTMLFormElement>(null);
  const [result, formAction, isPending] = useActionState(authenticate, null);

  return (
    <form
      className="grid gap-2"
      action={formAction}
      ref={formRef}
    >
      <div className="flex items-center">
        <Label htmlFor="token">Token</Label>
        <a
          href="https://t.me/ThreadsAlertsBot?start=auth"
          target="_blank"
          rel="noreferrer"
          className="ml-auto text-sm inline-block hover:underline underline-offset-4"
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