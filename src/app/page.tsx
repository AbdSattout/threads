import { isAuthenticated } from "@/auth";
import Link from "next/link";
import { redirect } from "next/navigation";

const Page = async () => {
  if (await isAuthenticated()) redirect("/home");

  return (
    <h1>
      Welcome to Threads!
      <br />
      Please <Link href="/login">login</Link> to continue.
    </h1>
  );
};

export default Page;
