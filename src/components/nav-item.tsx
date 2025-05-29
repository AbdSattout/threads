"use client";

import { Button } from "@/components/ui/button";
import Link, { LinkProps } from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

interface NavItemProps extends LinkProps {
  children: ReactNode;
}

const NavItem = ({ children, ...props }: NavItemProps) => {
  const pathname = usePathname();
  const active = pathname === props.href.toString();

  return (
    <Button
      asChild
      variant="ghost"
      size="icon"
      className={`rounded-full ${active ? "text-primary" : "text-muted-foreground"}`}
    >
      <Link {...props}>{children}</Link>
    </Button>
  );
};

export { NavItem };
