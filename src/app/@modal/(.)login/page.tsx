"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const Login = () => {
  const router = useRouter();

  return (
    <Dialog open={true} onOpenChange={() => router.back()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Login with Telegram</DialogTitle>
        </DialogHeader>
        <DialogClose asChild>
          <Button variant="ghost">Cancel</Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}

export default Login;