import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { BecomeSellerForm } from "@/components/BecomeSellerForm";

export const metadata = { title: "Become a Seller" };

export default async function BecomeSellerPage() {
  const session = await requireAuth("/login?next=/become-seller");
  const profile = await prisma.sellerProfile.findUnique({ where: { userId: session.userId } });
  if (profile || session.role === "SELLER") redirect("/seller/dashboard");

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-10">
      <div className="lx-card p-6 md:p-8">
        <h1 className="font-heading text-2xl font-extrabold">Become a seller</h1>
        <p className="mb-6 mt-1 text-sm text-[var(--text-muted)]">
          Your account stays a customer until you open a store. Add a store name to start selling on Lixazon.
        </p>
        <BecomeSellerForm />
      </div>
    </div>
  );
}
