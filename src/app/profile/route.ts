import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const GET = async () => {
  const session = await auth();
  const user = session?.user;

  if (user) redirect(`/user/${user.id}`);
  else redirect("/login");
};
