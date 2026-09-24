import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ProfileForm } from "@/components/AccountForms";

export const metadata = { title: "Profile" };

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/account/profile");
  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user) redirect("/login");

  return (
    <div className="w-full px-4 py-6">
      <nav className="text-xs text-mh-muted mb-3">
        <Link href="/account" className="text-mh-link hover:underline">
          Your Account
        </Link>
        {" › "}
        <span>Login & security</span>
      </nav>
      <h1 className="text-2xl font-bold mb-4">Login & security</h1>
      <div className="bg-white border border-mh-border rounded-lg p-6">
        <ProfileForm name={user.name} email={user.email} phone={user.phone || ""} />
      </div>
    </div>
  );
}
