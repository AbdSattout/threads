import { getSession } from "@/auth";
import { redirect } from "next/navigation";

export const GET = async () => {
  const session = await getSession();
  const user = session?.user;

  if (user) redirect(`/user/${user.id}`);
  else redirect("/login");
};
