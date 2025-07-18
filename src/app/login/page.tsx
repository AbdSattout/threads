import { isAuthenticated } from "@/auth";
import { LoginForm } from "@/components/login-form";
import { redirect } from "next/navigation";

const Login = async () => {
  if (await isAuthenticated()) redirect("/home");

  return (
    <div className="flex flex-col grow justify-center gap-6">
      <div className="grid gap-2">
        <h1 className="text-3xl font-bold">Welcome to Threads!</h1>
        <p className="text-balance text-muted-foreground">
          Login to start using Threads. If you don&apos;t have an account,
          don&apos;t worry, we&apos;ll create one for you.
        </p>
      </div>
      <LoginForm />
      <p className="text-center text-muted-foreground">
        Made with ❤️ by <a href="https://t.me/AbdSattout">Abd Sattout</a>
      </p>
    </div>
  );
};

export default Login;
