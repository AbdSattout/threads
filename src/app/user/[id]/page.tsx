import { Button } from "@/components/ui/button";
import { UserImage } from "@/components/user-image";
import { logout } from "@/lib/actions";
import { getUser } from "@/lib/db";
import { notFound } from "next/navigation";

const Profile = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const user = await getUser(id);

  if (!user) notFound();

  return (
    <div>
      <div className="flex gap-4 py-4">
        <UserImage name={user.name} size="lg" />
        <div className="flex flex-col justify-center">
          <h2 className="text-lg font-bold">{user.name}</h2>
          <p className="text-sm text-muted-foreground">@{user.id}</p>
        </div>
      </div>
      <Button onClick={logout} variant="outline" className="w-full">
        Logout
      </Button>
    </div>
  );
};

export default Profile;
