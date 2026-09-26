import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ProfileForm } from "@/components/AccountForms";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await requireAuth();
  const user = await prisma.user.findUniqueOrThrow({ where: { id: session.userId } });
  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-8">
      <h1 className="font-heading text-3xl font-extrabold mb-6">Profile</h1>
      <ProfileForm user={user} />
    </div>
  );
}
