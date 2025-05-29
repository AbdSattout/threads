import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface UserImageProps extends React.ComponentProps<typeof Avatar> {
  url?: string;
  name: string;
  size?: "sm" | "md" | "lg";
}

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
