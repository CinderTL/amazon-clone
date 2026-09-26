import { z } from "zod";
import { handleApiError, jsonOk, jsonError, readJson } from "@/lib/api";
import { requireApiSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/auth";

const profileSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional().nullable(),
  themePref: z.enum(["light", "dark", "system"]).optional().nullable(),
});

export async function PATCH(request: Request) {
  try {
    const session = await requireApiSession();
    const body = profileSchema.parse(await readJson(request));
    const user = await prisma.user.update({
      where: { id: session.userId },
      data: body,
      select: { id: true, email: true, name: true, phone: true, themePref: true, role: true },
    });
    return jsonOk({ user });
  } catch (error) {
    return handleApiError(error);
  }
}

const passwordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

export async function PUT(request: Request) {
  try {
    const session = await requireApiSession();
    const body = passwordSchema.parse(await readJson(request));
    const user = await prisma.user.findUniqueOrThrow({ where: { id: session.userId } });
    if (!(await verifyPassword(body.currentPassword, user.passwordHash))) {
      return jsonError("Current password is wrong", 400);
    }
    await prisma.user.update({
      where: { id: session.userId },
      data: { passwordHash: await hashPassword(body.newPassword) },
    });
    return jsonOk({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
