import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface UserImageProps extends React.ComponentProps<typeof Avatar> {
  /** Optional URL for the user's avatar image */
  url?: string;
  /** User's display name (used for alt text and fallback) */
  name: string;
  /** Size variant for the avatar */
  size?: "sm" | "md" | "lg";
}

/**
 * User avatar component with configurable size and fallback
 *
 * @example
 * // Basic usage
 * <UserImage name="John Doe" url="/avatars/john.jpg" />
 *
 * @example
 * // With custom size
 * <UserImage
 *   name="John Doe"
 *   url="/avatars/john.jpg"
 *   size="lg"
 *   className="border-2"
 * />
 */
const UserImage = ({
  url,
  name,
  size,
  className,
  ...props
}: UserImageProps) => {
  const sizeMap = {
    sm: "size-6",
    md: "size-10",
    lg: "size-15",
  };
  const sizeClass = size ? sizeMap[size] : sizeMap.md;

  return (
    <Avatar {...props} className={cn(sizeClass, className)}>
      <AvatarImage src={url} alt={`${name} on Threads`} />
      <AvatarFallback>{name.charAt(0).toUpperCase()}</AvatarFallback>
    </Avatar>
  );
};

export { UserImage };
