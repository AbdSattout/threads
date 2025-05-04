import { auth } from "@/auth";
import Link from "next/link";

const Page = async () => {
  const session = await auth();
  if (!session?.user) return <h1>Not logged in, <Link href="/login" className="text-sky-500 hover:underline underline-offset-4">login?</Link></h1>;
  return <h1>Logged in as {session.user.name} ({session.user.id}), <Link href="/logout" className="text-sky-500 hover:underline underline-offset-4">logout?</Link></h1>;
};

export default Page;