import { requireAuth } from "@/auth";

const Home = async () => {
  await requireAuth();

  return <h1>Home</h1>;
};

export default Home;
