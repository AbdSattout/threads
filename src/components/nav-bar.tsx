import { auth } from "@/auth";
import { NavItem } from "@/components/nav-item";
import { Edit, Heart, Home, Search, UserCircle2 } from "lucide-react";

const NavBar = async () => {
  const size = "size-5";
  const session = await auth();
  const user = session?.user;

  return (
    <nav className="fixed bottom-2 left-1/2 -translate-x-1/2 flex rounded-full shadow-sm bg-blur border gap-1 p-2">
      <NavItem href={user ? "/home" : "/"}>
        <Home className={size} />
      </NavItem>
      <NavItem href="#">
        <Search className={size} />
      </NavItem>
      <NavItem href="#">
        <Edit className={size} />
      </NavItem>
      <NavItem href="#">
        <Heart className={size} />
      </NavItem>
      <NavItem href={user ? `/user/${user.id}` : "/login"} as="/profile">
        <UserCircle2 className={size} />
      </NavItem>
    </nav>
  );
};

export { NavBar };
