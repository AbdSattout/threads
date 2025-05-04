"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "next/navigation";
import { LoginForm } from "@/components/login-form";

const Login = () => {
  const router = useRouter();
  const pathname = usePathname();

  if (pathname !== "/login") return null;

  return (
    <Dialog open={true} onOpenChange={() => router.back()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Login with Telegram</DialogTitle>
        </DialogHeader>
        <LoginForm />
        <DialogClose asChild>
          <Button variant="ghost">Cancel</Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}

export default Login;