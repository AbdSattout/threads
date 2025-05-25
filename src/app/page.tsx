import { auth } from "@/auth";
import { logout } from "@/lib/actions";
import Link from "next/link";

const Page = async () => {
  const session = await auth();
  if (!session?.user)
    return (
      <h1>
        Not logged in, <Link href="/login">login?</Link>
      </h1>
    );
  return (
    <h1>
      Logged in as {session.user.name} ({session.user.id}),{" "}
      <a href="/login" onClick={logout}>
        logout?
      </a>
    </h1>
  );
};

export default Page;
