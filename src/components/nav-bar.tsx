"use client";

import { Edit, Heart, Home, Search, UserCircle2 } from "lucide-react";
import { NavItem } from "@/components/nav-item";
import { usePathname } from "next/navigation";

const NavBar = () => {
  const size = "size-5";
  const pathname = usePathname();

  if (pathname === "/login") return null;

  return (
    <nav className="fixed bottom-2 left-1/2 -translate-x-1/2 flex rounded-full shadow-sm bg-blur border gap-1 p-2">
      <NavItem href="/">
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
      <NavItem href={`/login?to=${pathname}`} onClick={e => {
        if (pathname !== "/") return;
        e.preventDefault();
        window.location.href = "/login";
      }}>
        <UserCircle2 className={size} />
      </NavItem>
    </nav>
  );
};

export { NavBar };
