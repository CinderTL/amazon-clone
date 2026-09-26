import { jsonOk, jsonError } from "@/lib/api";
import { getApiSession } from "@/lib/session";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getApiSession();
  if (!session) return jsonError("Unauthorized", 401);
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { sellerProfile: true },
  });
  if (!user) return jsonError("Unauthorized", 401);
  return jsonOk({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone,
      themePref: user.themePref,
      sellerProfile: user.sellerProfile,
    },
  });
}
