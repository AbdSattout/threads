"use client";

import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import Link, { LinkProps } from "next/link";

interface NavItemProps extends LinkProps {
  children: ReactNode;
}

const NavItem = ({ children, ...props }: NavItemProps) => {
  const pathname = usePathname();
  const active = props.href === pathname;

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
