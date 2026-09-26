import { Role } from "@/generated/prisma/client";
import { z } from "zod";
import { handleApiError, jsonError, jsonOk, readJson } from "@/lib/api";
import { createSession, hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/db";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
});

export async function POST(request: Request) {
  try {
    const body = schema.parse(await readJson(request));
    const existing = await prisma.user.findUnique({ where: { email: body.email.toLowerCase() } });
    if (existing) return jsonError("Email already registered", 409);

    const passwordHash = await hashPassword(body.password);
    const user = await prisma.user.create({
      data: {
        email: body.email.toLowerCase(),
        passwordHash,
        name: body.name,
        role: Role.CUSTOMER,
        authProvider: "credentials",
        cart: { create: {} },
        wishlist: { create: {} },
      },
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
        },
      },
      201
    );
  } catch (error) {
    return handleApiError(error);
  }
}
