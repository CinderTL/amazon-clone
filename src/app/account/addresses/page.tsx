import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AddressManager } from "@/components/AddressManager";

export const metadata = { title: "Your Addresses" };

export default async function AddressesPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/account/addresses");

  const addresses = await prisma.address.findMany({
    where: { userId: session.userId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });

  return (
    <div className="w-full px-4 py-6">
      <nav className="text-xs text-mh-muted mb-3">
        <Link href="/account" className="text-mh-link hover:underline">
          Your Account
        </Link>
        {" › "}
        <span>Your Addresses</span>
      </nav>
      <h1 className="text-2xl font-bold mb-4">Your Addresses</h1>
      <AddressManager addresses={addresses} />
    </div>
  );
}
