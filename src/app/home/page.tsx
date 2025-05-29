import { auth } from "@/auth";
import { redirect } from "next/navigation";

const Home = async () => {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return <h1>Home</h1>;
};

export default Home;
