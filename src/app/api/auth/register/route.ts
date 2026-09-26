import { Role } from "@prisma/client";
import { z } from "zod";
import { handleApiError, jsonError, jsonOk, readJson } from "@/lib/api";
import { createSession, hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/db";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
  role: z.enum(["CUSTOMER", "SELLER"]).default("CUSTOMER"),
  storeName: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = schema.parse(await readJson(request));
    const existing = await prisma.user.findUnique({ where: { email: body.email.toLowerCase() } });
    if (existing) return jsonError("Email already registered", 409);

    const passwordHash = await hashPassword(body.password);
    const role = body.role === "SELLER" ? Role.SELLER : Role.CUSTOMER;

    const user = await prisma.user.create({
      data: {
        email: body.email.toLowerCase(),
        passwordHash,
        name: body.name,
        role,
        cart: { create: {} },
        wishlist: { create: {} },
        sellerProfile:
          role === Role.SELLER
            ? {
                create: {
                  storeName: body.storeName || `${body.name}'s Store`,
                  slug: `${body.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now().toString(36)}`,
                  description: "New Lixazon seller",
                },
              }
            : undefined,
      },
      include: { sellerProfile: true },
    });

    await createSession({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    return jsonOk(
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          sellerProfile: user.sellerProfile,
        },
      },
      201
    );
  } catch (error) {
    return handleApiError(error);
  }
}
