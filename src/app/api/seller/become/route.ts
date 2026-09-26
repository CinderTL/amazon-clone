import { Role } from "@/generated/prisma/client";
import { z } from "zod";
import { handleApiError, jsonError, jsonOk, readJson } from "@/lib/api";
import { createSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getApiSession } from "@/lib/session";
import { slugify } from "@/lib/utils";

const schema = z.object({
  storeName: z.string().trim().min(2).max(80),
  description: z.string().trim().max(500).optional(),
});

export async function POST(request: Request) {
  try {
    const session = await getApiSession();
    if (!session) return jsonError("Unauthorized", 401);
    const body = schema.parse(await readJson(request));

    const existing = await prisma.sellerProfile.findUnique({ where: { userId: session.userId } });
    if (existing || session.role === Role.SELLER) {
      const user = await prisma.user.findUnique({ where: { id: session.userId } });
      if (user && user.role !== Role.SELLER && existing) {
        await prisma.user.update({ where: { id: user.id }, data: { role: Role.SELLER } });
        await createSession({
          userId: user.id,
          email: user.email,
          name: user.name,
          role: Role.SELLER,
        });
      }
      return jsonOk({ sellerProfile: existing });
    }

    let slug = slugify(body.storeName) || "store";
    const taken = await prisma.sellerProfile.findUnique({ where: { slug } });
    if (taken) slug = `${slug}-${Date.now().toString(36)}`;

    const profile = await prisma.sellerProfile.create({
      data: {
        userId: session.userId,
        storeName: body.storeName,
        slug,
        description: body.description || "New Lixazon seller",
      },
    });

    const user = await prisma.user.update({
      where: { id: session.userId },
      data: { role: Role.SELLER },
    });

    await createSession({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    return jsonOk({ sellerProfile: profile }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
