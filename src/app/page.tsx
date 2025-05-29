import { auth } from "@/auth";
import Link from "next/link";
import { redirect } from "next/navigation";

const Page = async () => {
  const session = await auth();
  if (session?.user) redirect("/home");

  return (
    <h1>
      Welcome to Threads!
      <br />
      Please <Link href="/login">login</Link> to continue.
    </h1>
  );
};

export default Page;
