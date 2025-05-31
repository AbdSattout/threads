"use client";

import { Button } from "@/components/ui/button";
import Link, { LinkProps } from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

interface NavItemProps extends LinkProps {
  /** Should be an icon component */
  children: ReactNode;
}

/**
 * NavItem component with active state based on current path
 *
 * @example
 * // Basic usage with an icon
 * <NavItem href="/home">
 *   <HomeIcon className="size-5" />
 * </NavItem>
 */
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
