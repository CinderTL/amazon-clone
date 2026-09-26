import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AddressManager } from "@/components/AddressManager";

export const dynamic = "force-dynamic";

export default async function AddressesPage() {
  const session = await requireAuth();
  const addresses = await prisma.address.findMany({
    where: { userId: session.userId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-8">
      <h1 className="font-heading text-3xl font-extrabold mb-6">Addresses</h1>
      <AddressManager initial={addresses} />
    </div>
  );
}
